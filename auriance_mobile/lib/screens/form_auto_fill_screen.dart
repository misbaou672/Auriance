import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../services/file_storage_service.dart';
import '../services/pdf_service.dart';
import '../services/stt_service.dart';
import 'auto_form_saved_page.dart';

/// Écran de formulaire médical auto-rempli via le Backend AURIANCE
class FormAutoFillScreen extends StatefulWidget {
  final Map<String, dynamic> formData;
  const FormAutoFillScreen({super.key, required this.formData});

  @override
  State<FormAutoFillScreen> createState() => _FormAutoFillScreenState();
}

class _FormAutoFillScreenState extends State<FormAutoFillScreen> {
  late final TextEditingController nomController;
  late final TextEditingController ageController;
  late final TextEditingController symptomesController;
  late final TextEditingController diagnosticController;
  late final TextEditingController traitementController;
  late final TextEditingController temperatureController;

  bool isProcessing = false;

  String? _lastPdfPath;

  Timer? _extractDebounce;
  String _lastQueuedText = '';
  String _lastLocalPreviewText = '';
  VoidCallback? _sttListener;

  Future<String> _waitForStableTranscript(SttService stt) async {
    // After stopping listening, some engines update `finalText` a tick later.
    // We wait briefly for stabilization to avoid missing the last sentence.
    final deadline = DateTime.now().add(const Duration(milliseconds: 1600));
    String last = (stt.finalText.isNotEmpty ? stt.finalText : stt.text).trim();
    var stableTicks = 0;
    while (DateTime.now().isBefore(deadline)) {
      await Future.delayed(const Duration(milliseconds: 120));
      final current =
          (stt.finalText.isNotEmpty ? stt.finalText : stt.text).trim();
      if (current.isEmpty) {
        continue;
      }
      if (current == last) {
        stableTicks++;
        // Require two stable ticks to reduce “cut” transcripts.
        if (stableTicks >= 2) {
          return current;
        }
      } else {
        stableTicks = 0;
      }
      last = current;
    }
    return last;
  }

  bool _isMissingEssentialFields() {
    return nomController.text.trim().isEmpty ||
        ageController.text.trim().isEmpty ||
        symptomesController.text.trim().isEmpty;
  }

  void _clearFormFields() {
    nomController.clear();
    ageController.clear();
    symptomesController.clear();
    diagnosticController.clear();
    traitementController.clear();
    temperatureController.clear();
    setState(() {
      _lastQueuedText = '';
      _lastLocalPreviewText = '';
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
          content: Text('Formulaire effacé. Vous pouvez recommencer.')),
    );
  }

  @override
  void initState() {
    super.initState();
    nomController = TextEditingController();
    ageController = TextEditingController();
    symptomesController = TextEditingController();
    diagnosticController = TextEditingController();
    traitementController = TextEditingController();
    temperatureController = TextEditingController();

    // Pré-remplissage si on a des données passées via navigation.
    _applyFormData(widget.formData);

    // Listener STT: on capte le texte pendant l'écoute, mais on n'extrait pas
    // tant que l'utilisateur n'a pas appuyé sur STOP.
    // (Évite le spam backend et les arrêts inattendus de certains moteurs STT.)
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final stt = context.read<SttService>();

      // IMPORTANT: si on arrive ici depuis une autre page (session consultation),
      // on veut remplir immédiatement avec la transcription déjà présente,
      // même si le micro n'est plus en écoute.
      final existing =
          (stt.finalText.isNotEmpty ? stt.finalText : stt.text).trim();
      if (existing.isNotEmpty && !isProcessing) {
        // Pas de toast ici pour éviter un spam visuel à l'ouverture.
        _extractFromText(existing, showSuccessToast: false);
      }

      _sttListener = () {
        if (!mounted) return;
        // Prefer the stabilized transcript when available.
        final text =
            (stt.finalText.isNotEmpty ? stt.finalText : stt.text).trim();
        if (text.isEmpty) return;

        // IMPORTANT:
        // Sur Android, `speech_to_text` peut passer à `notListening/done` très
        // fréquemment (après une pause ou un résultat final). On veut quand même
        // extraire/remplir dès qu'un nouveau texte arrive, même si `isListening`
        // est momentanément false.

        // Évite de spammer le backend: on attend une pause (debounce)
        // et on ne relance pas si le texte n'a pas changé.
        if (text == _lastQueuedText) return;
        _lastQueuedText = text;

        // Debug utile pour valider que l'auto-extraction se déclenche bien.
        // (Visible dans le logcat / console Flutter en mode debug)
        // ignore: avoid_print
        debugPrint('[FormAutoFill] queued text (${text.length} chars)');

        // Live local preview (fast + offline): fills progressively while speaking.
        // This avoids having to repeat yourself 2-3 times before fields appear.
        _extractDebounce?.cancel();
        _extractDebounce = Timer(const Duration(milliseconds: 450), () {
          if (!mounted) return;
          if (!stt.isListening) return;
          _applyLocalPreviewFill(text);
        });
      };
      stt.addListener(_sttListener!);
    });
  }

  void _applyLocalPreviewFill(String rawText) {
    final normalized = _normalizeDictationText(rawText);
    if (normalized.isEmpty) return;
    if (normalized == _lastLocalPreviewText) return;
    _lastLocalPreviewText = normalized;

    final local = _localExtractFormFields(normalized);

    setState(() {
      final localPrenom = (local['prenom'] ?? '').trim();
      final localNom = (local['nom'] ?? '').trim();
      final localFullName = [localPrenom, localNom]
          .where((v) => v.trim().isNotEmpty)
          .join(' ')
          .trim();
      if (nomController.text.trim().isEmpty && localFullName.isNotEmpty) {
        nomController.text = localFullName;
      }

      final localAge = (local['age'] ?? '').trim();
      if (ageController.text.trim().isEmpty && localAge.isNotEmpty) {
        ageController.text = localAge;
      }

      final localTemp = (local['temperature'] ?? '').trim();
      if (temperatureController.text.trim().isEmpty && localTemp.isNotEmpty) {
        temperatureController.text = localTemp;
      }

      final localSym = (local['symptomes'] ?? '').trim();
      if (localSym.isNotEmpty) {
        symptomesController.text =
            _mergeListText(symptomesController.text, localSym);
      }

      final localDiag = (local['diagnostic'] ?? '').trim();
      if (localDiag.isNotEmpty) {
        diagnosticController.text =
            _mergeListText(diagnosticController.text, localDiag);
      }

      final localTreat = (local['traitement'] ?? '').trim();
      if (localTreat.isNotEmpty) {
        traitementController.text =
            _mergeListText(traitementController.text, localTreat);
      }
    });
  }

  @override
  void dispose() {
    _extractDebounce?.cancel();
    if (_sttListener != null) {
      try {
        context.read<SttService>().removeListener(_sttListener!);
      } catch (_) {
        // ignore: provider might already be disposed during hot-restart
      }
    }
    nomController.dispose();
    ageController.dispose();
    symptomesController.dispose();
    diagnosticController.dispose();
    traitementController.dispose();
    temperatureController.dispose();
    super.dispose();
  }

  Future<void> _toggleVoiceFilling(SttService stt) async {
    if (stt.isListening) {
      debugPrint('[FormAutoFill] Manually stopping recording...');
      await stt.stopListening();
      final text = await _waitForStableTranscript(stt);
      if (!mounted) return;

      if (text.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Aucun texte détecté à analyser.')),
        );
        return;
      }

      debugPrint('[FormAutoFill] Force extraction on stop: $text');
      final firstText = text;
      await _extractFromText(firstText, allowBackend: true);

      // Some engines append the very last sentence slightly after stop.
      // If essential fields are still missing, do a second LOCAL-ONLY pass.
      if (!mounted) return;
      if (_isMissingEssentialFields()) {
        await Future.delayed(const Duration(milliseconds: 650));
        final updated =
            (stt.finalText.isNotEmpty ? stt.finalText : stt.text).trim();
        if (!mounted) return;
        if (updated.isNotEmpty && updated != firstText) {
          debugPrint('[FormAutoFill] Second-pass local fill (no backend)');
          await _extractFromText(updated,
              allowBackend: false, showSuccessToast: false);
        }
      }
    } else {
      debugPrint('[FormAutoFill] Starting recording...');
      await stt.initialize(preferredLocale: 'fr_FR');
      if (stt.isAvailable) {
        stt.clear();
        await stt.startListening();
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
                'Service vocal non disponible. Vérifiez la permission micro.'),
          ),
        );
      }
    }
    if (mounted) setState(() {});
  }

  void _ensureDefaultPatientName() {
    if (nomController.text.trim().isEmpty) {
      nomController.text = 'Patient Inconnu';
    }
  }

  Future<void> _showPathDialog({
    required String title,
    required String path,
  }) async {
    if (!mounted) return;
    await showDialog<void>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text(title),
          content: SelectableText(path),
          actions: [
            TextButton(
              onPressed: () async {
                await Clipboard.setData(ClipboardData(text: path));
                if (!context.mounted) return;
                Navigator.of(context).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Chemin copié')),
                );
              },
              child: const Text('COPIER'),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('FERMER'),
            ),
          ],
        );
      },
    );
  }

  Future<String> _saveToLocalHistory({String? pdfPath}) async {
    final stt = context.read<SttService>();
    final voiceText =
        (stt.finalText.isNotEmpty ? stt.finalText : stt.text).trim();
    final historyText = voiceText.isNotEmpty
        ? '${generatePdfContent()}\n\n---\nTranscription dictée:\n$voiceText'
        : generatePdfContent();

    return FileStorageService().saveHistoryEntry(
      type: 'formulaire',
      transcription: historyText,
      patientName:
          nomController.text.trim().isEmpty ? null : nomController.text.trim(),
      symptoms: symptomesController.text.trim().isEmpty
          ? null
          : symptomesController.text.trim(),
      diagnosis: diagnosticController.text.trim().isEmpty
          ? null
          : diagnosticController.text.trim(),
      treatment: traitementController.text.trim().isEmpty
          ? null
          : traitementController.text.trim(),
      pdfPath: pdfPath,
    );
  }

  Future<void> _saveConsultationOnly() async {
    _ensureDefaultPatientName();

    setState(() => isProcessing = true);
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    final apiService = context.read<ApiService>();

    String statusMessage = '';
    bool dbSuccess = false;
    String? historyPath;

    // 1) DB
    try {
      debugPrint('[FormAutoFill] Sending consultation to backend...');
      final dbResult = await apiService.saveConsultation(
        transcription: 'Formulaire rempli par voix (Universal)',
        nom: nomController.text,
        symptomes: symptomesController.text,
        diagnostic: diagnosticController.text,
        traitement: traitementController.text,
        age: int.tryParse(ageController.text) ?? 0,
        temperature:
            double.tryParse(temperatureController.text.replaceAll(',', '.')) ??
                0.0,
      );
      debugPrint('[FormAutoFill] DB Save Success: $dbResult');
      dbSuccess = true;
      statusMessage +=
          '✅ Base de données OK (ID: ${dbResult['consultation_id']})\n';
    } catch (e) {
      debugPrint('[FormAutoFill] DB SAVE ERROR: $e');
      statusMessage += '❌ Base de données: Échec (connexion?)\n';
    }

    // 2) Historique local
    try {
      debugPrint('[FormAutoFill] Saving local history entry (formulaire)...');
      historyPath = await _saveToLocalHistory(pdfPath: null);
      statusMessage += '✅ Historique local enregistré';
    } catch (e) {
      debugPrint('[FormAutoFill] LOCAL HISTORY ERROR: $e');
      statusMessage += '❌ Historique local: Échec ($e)';
    }

    if (!mounted) return;

    scaffoldMessenger.showSnackBar(
      SnackBar(
        content: Text(statusMessage.trim().isEmpty
            ? 'Sauvegarde terminée'
            : statusMessage.trim()),
        backgroundColor: dbSuccess ? Colors.green : Colors.orange,
        duration: const Duration(seconds: 5),
        action: (historyPath != null)
            ? SnackBarAction(
                label: 'CHEMIN',
                textColor: Colors.white,
                onPressed: () {
                  _showPathDialog(
                    title: 'Historique local',
                    path: historyPath!,
                  );
                },
              )
            : null,
      ),
    );

    if (mounted) setState(() => isProcessing = false);
  }

  Future<void> _exportPdfOnly() async {
    _ensureDefaultPatientName();

    setState(() => isProcessing = true);
    final scaffoldMessenger = ScaffoldMessenger.of(context);

    String statusMessage = '';
    bool pdfSuccess = false;
    String? historyPath;

    // 1) PDF local
    String? pdfPath;
    try {
      debugPrint('[FormAutoFill] Generating PDF...');
      pdfPath = await PdfService.saveTranscriptionPdf(
        text: generatePdfContent(),
        title: 'Consultation - ${nomController.text}',
        logoAssetPath: 'assets/images/logo.png',
        preferAppMedia: true,
      );
      _lastPdfPath = pdfPath;
      debugPrint('[FormAutoFill] PDF Generated at: $pdfPath');
      pdfSuccess = true;
      statusMessage += '✅ PDF généré avec succès\n';
    } catch (e) {
      debugPrint('[FormAutoFill] PDF ERROR: $e');
      statusMessage += '❌ PDF: Échec ($e)\n';
    }

    // 2) Historique local (avec pdfPath)
    try {
      debugPrint(
          '[FormAutoFill] Saving local history entry (formulaire+pdf)...');
      historyPath = await _saveToLocalHistory(pdfPath: pdfPath);
      statusMessage += '✅ Historique local enregistré';
    } catch (e) {
      debugPrint('[FormAutoFill] LOCAL HISTORY ERROR: $e');
      statusMessage += '❌ Historique local: Échec ($e)';
    }

    if (!mounted) return;

    scaffoldMessenger.showSnackBar(
      SnackBar(
        content: Text(statusMessage.trim().isEmpty
            ? 'Export PDF terminé'
            : statusMessage.trim()),
        backgroundColor: pdfSuccess ? Colors.green : Colors.red,
        duration: const Duration(seconds: 6),
        action: (_lastPdfPath != null || historyPath != null)
            ? SnackBarAction(
                label: (_lastPdfPath != null) ? 'CHEMIN PDF' : 'CHEMIN',
                textColor: Colors.white,
                onPressed: () {
                  final path = _lastPdfPath ?? historyPath;
                  if (path == null) return;
                  _showPathDialog(
                    title: (_lastPdfPath != null) ? 'PDF' : 'Historique local',
                    path: path,
                  );
                },
              )
            : null,
      ),
    );

    if (mounted) setState(() => isProcessing = false);
  }

  void _applyFormData(Map<String, dynamic> data) {
    if (data.isEmpty) return;
    final nom = data['nom'] ?? data['full_name'] ?? data['fullName'];
    final age = data['age'];
    final symptomes = data['symptomes'] ?? data['symptoms'];
    final diagnostic = data['diagnostic'] ?? data['diagnosis'];
    final traitement = data['traitement'] ?? data['treatment'];
    final temperature = data['temperature'] ?? data['temp'];

    if (nom != null) nomController.text = nom.toString();
    if (age != null) ageController.text = age.toString();
    if (symptomes != null) symptomesController.text = symptomes.toString();
    if (diagnostic != null) diagnosticController.text = diagnostic.toString();
    if (traitement != null) traitementController.text = traitement.toString();
    if (temperature != null) {
      temperatureController.text = temperature.toString();
    }
  }

  List<String> _splitListItems(String input) {
    var s = input
        .replaceAll('\u00A0', ' ')
        .replaceAll(RegExp(r'\s{2,}'), ' ')
        .trim();
    if (s.isEmpty) return const [];

    // Remove leading punctuation / connectors.
    s = s.replaceAll(RegExp(r"^[\s\-:;,.]+"), '').trim();
    s = s.replaceAll(
        RegExp(r"^(?:c'?est|est|il\s+s'agit\s+de)\s+", caseSensitive: false),
        '');

    // Split common separators (including STT "et" / "puis" / "avec").
    final parts = s
        .split(RegExp(
            r"\s*(?:,|;|\.|/|\\|\b(et|puis|ainsi\s+que|avec|plus|\+)\b)\s*",
            caseSensitive: false))
        .map((p) => p.trim())
        .where((p) => p.isNotEmpty)
        .toList();

    // Clean trailing connector fragments.
    final cleaned = <String>[];
    for (final p in parts) {
      var item = p
          .replaceAll(RegExp(r"^[\-:;,.]+"), '')
          .replaceAll(RegExp(r"[\-:;,.]+$"), '')
          .trim();
      if (item.isEmpty) continue;
      cleaned.add(item);
    }

    // Dedupe case-insensitively.
    final seen = <String>{};
    final out = <String>[];
    for (final item in cleaned) {
      final key = item.toLowerCase();
      // Drop common noisy tokens from STT.
      const noisy = <String>{
        'et',
        'euh',
        'hum',
        'ok',
        'd\'accord',
        'accord',
        'écrit',
        'ecrit',
        'diagnostic',
        'diagnostics',
        'traitement',
        'prescription',
        'ordonnance',
      };
      if (noisy.contains(key)) continue;
      if (key.length < 3) continue;
      if (seen.add(key)) out.add(item);
    }
    return out;
  }

  String _formatListItems(String input) {
    final items = _splitListItems(input);
    if (items.isEmpty) return '';
    if (items.length == 1) return items.first;
    return items.join('\n');
  }

  String _mergeListText(String existing, String incoming) {
    final a = _splitListItems(existing);
    final b = _splitListItems(incoming);
    if (a.isEmpty) return _formatListItems(incoming);
    if (b.isEmpty) return _formatListItems(existing);

    final seen = <String>{};
    final merged = <String>[];
    for (final item in [...a, ...b]) {
      final key = item.toLowerCase();
      if (seen.add(key)) merged.add(item);
    }
    return merged.join('\n');
  }

  Widget buildFormField(String label, TextEditingController controller,
      {TextInputType? keyboardType, int maxLines = 1}) {
    return TextField(
      controller: controller,
      decoration: InputDecoration(
        labelText: label,
        border: const OutlineInputBorder(),
        filled: true,
        fillColor: Colors.white,
      ),
      keyboardType: keyboardType,
      maxLines: maxLines,
    );
  }

  String generatePdfContent() {
    return '''
      Consultation Médicale - AURIANCE
      ===============================

      Nom du patient : ${nomController.text}
      Âge : ${ageController.text} ans
      Température : ${temperatureController.text} °C

      Symptômes :
      ${symptomesController.text}

      Diagnostic :
      ${diagnosticController.text}

      Traitement Prescrit :
      ${traitementController.text}

      --------------------------------
      Généré par AURIANCE AI
      ''';
  }

  String _normalizeDictationText(String input) {
    var t = input.trim();
    if (t.isEmpty) return t;

    // Normalize whitespace and common French STT artifacts.
    t = t.replaceAll(RegExp(r'[\u00A0\t\r\n]+'), ' ');
    t = t.replaceAll(RegExp(r'\s{2,}'), ' ');

    // FR dictation sometimes injects money words/symbols after numbers.
    // Example seen in logs: "âge 45 €" / "température 32 centime".
    t = t.replaceAll('€', ' ');
    t = t.replaceAll(RegExp(r'\bcentimes?\b', caseSensitive: false), ' ');
    t = t.replaceAll(RegExp(r'\s{2,}'), ' ');

    // Normalize decimal words often used in French dictation.
    // "trente-huit virgule cinq" => "trente-huit . cinq" (parsed later)
    t = t.replaceAll(RegExp(r'\bvirgule\b', caseSensitive: false), '.');
    t = t.replaceAll(RegExp(r'\bpoint\b', caseSensitive: false), '.');

    // Normalize apostrophes.
    t = t.replaceAll('’', "'");
    // Normalize degrees / temperature tokens.
    t = t
        .replaceAll(RegExp(r'\bdegr[ée]s?\b', caseSensitive: false), '°')
        .replaceAll(RegExp(r'\bcelcius\b', caseSensitive: false), 'celsius');

    // Common French STT confusions seen in logs.
    t = t.replaceAll(RegExp(r'\bpassion\b', caseSensitive: false), 'patient');
    t = t.replaceAll(RegExp(r'\bmus[eé]e\b', caseSensitive: false), 'nausée');
    return t.trim();
  }

  int? _tryParseFrenchNumberWords(String input) {
    var s = input
        .toLowerCase()
        .replaceAll('°', ' ')
        .replaceAll(RegExp(r"[^a-zà-ÿ\-\s]"), ' ')
        .replaceAll(RegExp(r'\s{2,}'), ' ')
        .trim();
    if (s.isEmpty) return null;

    // Allow hyphenated forms.
    final tokens = s
        .split(RegExp(r'[\s\-]+'))
        .map((t) => t.trim())
        .where((t) => t.isNotEmpty && t != 'et')
        .toList();
    if (tokens.isEmpty) return null;

    const units = <String, int>{
      'zéro': 0,
      'zero': 0,
      'un': 1,
      'une': 1,
      'deux': 2,
      'trois': 3,
      'quatre': 4,
      'cinq': 5,
      'six': 6,
      'sept': 7,
      'huit': 8,
      'neuf': 9,
      'dix': 10,
      'onze': 11,
      'douze': 12,
      'treize': 13,
      'quatorze': 14,
      'quinze': 15,
      'seize': 16,
    };
    const tens = <String, int>{
      'vingt': 20,
      'trente': 30,
      'quarante': 40,
      'cinquante': 50,
      'soixante': 60,
    };

    // Handle "quatre vingt" => 80.
    int i = 0;
    int total = 0;
    while (i < tokens.length) {
      final tok = tokens[i];
      if (tok == 'cent' || tok == 'cents') {
        total = (total == 0 ? 1 : total) * 100;
        i++;
        continue;
      }

      // 80/90 cases: "quatre" "vingt" ...
      if (tok == 'quatre' &&
          i + 1 < tokens.length &&
          (tokens[i + 1] == 'vingt' || tokens[i + 1] == 'vingts')) {
        total += 80;
        i += 2;
        continue;
      }

      // 70 cases: "soixante" "dix" / "soixante" "onze" ...
      if (tok == 'soixante' && i + 1 < tokens.length) {
        final next = tokens[i + 1];
        if (units.containsKey(next) && units[next]! >= 10) {
          total += 60 + units[next]!;
          i += 2;
          continue;
        }
        if (next == 'dix' &&
            i + 2 < tokens.length &&
            units.containsKey(tokens[i + 2])) {
          total += 60 + 10 + units[tokens[i + 2]]!;
          i += 3;
          continue;
        }
      }

      // 90 cases: "quatre" "vingt" "dix" ...
      if (tok == 'quatre' &&
          i + 2 < tokens.length &&
          (tokens[i + 1] == 'vingt' || tokens[i + 1] == 'vingts') &&
          tokens[i + 2] == 'dix') {
        total += 90;
        i += 3;
        continue;
      }

      if (tens.containsKey(tok)) {
        total += tens[tok]!;
        i++;
        if (i < tokens.length &&
            units.containsKey(tokens[i]) &&
            units[tokens[i]]! < 10) {
          total += units[tokens[i]]!;
          i++;
        }
        continue;
      }

      if (units.containsKey(tok)) {
        total += units[tok]!;
        i++;
        continue;
      }

      // Unknown token => give up.
      return null;
    }

    return total;
  }

  Map<String, String> _localExtractFormFields(String text) {
    final t = _normalizeDictationText(text);
    final out = <String, String>{};

    final lower = t.toLowerCase();

    String? extractAfter(RegExp pattern) {
      final m = pattern.firstMatch(t);
      if (m == null) return null;
      final v = (m.group(1) ?? '').trim();
      return v.isEmpty ? null : v;
    }

    // --- NOM / PRÉNOM ---
    // Examples:
    // - "le nom c'est Violette"
    // - "nom: Jean Dupont"
    // - "prénom Marie"
    final prenom = extractAfter(
      RegExp(
        r"\bpr[ée]nom\b\s*(?:c'?est|est|:)?\s*([A-Za-z\u00C0-\u00FF'\-]+(?:\s+[A-Za-z\u00C0-\u00FF'\-]+){0,2})",
        caseSensitive: false,
      ),
    );
    if (prenom != null) out['prenom'] = prenom;

    // Also accept: "je m'appelle X" / "patient s'appelle X"
    final saidName = extractAfter(
      RegExp(
        r"\b(?:je\s+m'?appelle|s'?appelle|s'appelle)\b\s*([A-Za-z\u00C0-\u00FF'\-]+(?:\s+[A-Za-z\u00C0-\u00FF'\-]+){0,3})",
        caseSensitive: false,
      ),
    );
    if (saidName != null &&
        (out['nom'] == null || out['nom']!.trim().isEmpty)) {
      out['nom'] = saidName;
    }

    final nom = extractAfter(
      RegExp(
        r"(?:\ble\b\s+)?\bnom\b\s*(?:c'?est|est|:)?\s*([A-Za-z\u00C0-\u00FF'\-]+(?:\s+[A-Za-z\u00C0-\u00FF'\-]+){0,3})",
        caseSensitive: false,
      ),
    );
    if (nom != null) out['nom'] = nom;

    // If only 'nom' is provided but it's clearly a full name, split it.
    if (out['prenom'] == null && out['nom'] != null) {
      final parts = out['nom']!
          .split(RegExp(r'\s+'))
          .map((p) => p.trim())
          .where((p) => p.isNotEmpty)
          .toList();
      if (parts.length >= 2) {
        out['prenom'] = parts.first;
        out['nom'] = parts.sublist(1).join(' ');
      }
    }

    // Age: "45 ans" or "âge 45"
    final ageMatch = RegExp(
      r'(?:\bâgé\b\s*de\s*)?(?:\bâge\b|\bage\b)?\s*(?:de\s*)?(\d{1,3})\b|\b(\d{1,3})\s*(?:ans|an)\b',
      caseSensitive: false,
    ).firstMatch(t);
    final age = (ageMatch?.group(1) ?? ageMatch?.group(2) ?? '').trim();
    if (age.isNotEmpty) {
      out['age'] = age;
    } else {
      // Age in words: "âge quarante cinq" / "âgé de quarante-cinq ans"
      final ageWords = extractAfter(
        RegExp(
          r"\b(?:âgé\s*de\s*)?(?:âge|age)\b\s*([a-zà-ÿ\-\s]{3,40})\b(?:ans|an)\b",
          caseSensitive: false,
        ),
      );
      final parsed =
          ageWords == null ? null : _tryParseFrenchNumberWords(ageWords);
      if (parsed != null && parsed > 0 && parsed < 130) {
        out['age'] = parsed.toString();
      }
    }

    // Temperature:
    // - "température 38,5" / "température 38.5"
    // - "température trente huit virgule cinq"
    final tempMatch = RegExp(
      r"\btemp(?:é|e)rature\b\s*(?:est\s*à\s*|:)?\s*([^,;]{1,30})",
      caseSensitive: false,
    ).firstMatch(t);
    final tempRaw = (tempMatch?.group(1) ?? '').trim();
    if (tempRaw.isNotEmpty) {
      final digits =
          RegExp(r"(\d{2}(?:[\.,]\d)?)").firstMatch(tempRaw)?.group(1);
      final tempNum =
          digits != null ? double.tryParse(digits.replaceAll(',', '.')) : null;
      if (tempNum != null && tempNum >= 30 && tempNum <= 45) {
        out['temperature'] = tempNum.toStringAsFixed(tempNum % 1 == 0 ? 0 : 1);
      } else {
        // Words-only temp: parse integer part; if we detect decimals as "X . Y", keep 1 decimal.
        final parts = tempRaw.split('.').map((p) => p.trim()).toList();
        final intPart = _tryParseFrenchNumberWords(parts.first);
        if (intPart != null && intPart >= 30 && intPart <= 45) {
          if (parts.length >= 2) {
            final decPart = _tryParseFrenchNumberWords(parts[1]);
            if (decPart != null && decPart >= 0 && decPart <= 9) {
              out['temperature'] = '$intPart.$decPart';
            } else {
              out['temperature'] = intPart.toString();
            }
          } else {
            out['temperature'] = intPart.toString();
          }
        }
      }
    }

    // Section extractor (captures until next section keyword).
    String? extractSection(List<String> starts, List<String> stops) {
      final startAlt = starts.map(RegExp.escape).join('|');
      final stopAlt = stops.map(RegExp.escape).join('|');
      final re = RegExp(
        r"\b(?:" +
            startAlt +
            r")\b\s*(?:c'?est|est|:|-)?\s*(.+?)(?=\b(?:" +
            stopAlt +
            r")\b|$)",
        caseSensitive: false,
        dotAll: false,
      );
      final m = re.firstMatch(t);
      final v = (m?.group(1) ?? '').trim();
      return v.isEmpty ? null : v;
    }

    // --- SYMPTÔMES (multi-items) ---
    final symptomStops = <String>[
      'diagnostic',
      'diagnostics',
      'traitement',
      'prescris',
      'prescrire',
      'ordonnance',
      'prescription',
      'température',
      'temperature',
    ];
    final symptomsRaw = extractSection(
            ['symptômes', 'symptomes', 'symptôme', 'symptome'], symptomStops) ??
        extractSection(['présente', 'present', 'souffre de', 'se plaint de'],
            symptomStops) ??
        extractAfter(
          RegExp(
            r"\b(?:a|présente|souffre\s+de|se\s+plaint\s+de)\b\s+(.+?)(?=\b(?:diagnostic|traitement|ordonnance|prescription)\b|$)",
            caseSensitive: false,
          ),
        );

    if (symptomsRaw != null && symptomsRaw.length >= 3) {
      final formatted = _formatListItems(symptomsRaw);
      if (formatted.isNotEmpty) out['symptomes'] = formatted;
    }

    // Fallback symptoms detection for common phrases.
    if ((out['symptomes'] ?? '').trim().isEmpty) {
      final found = <String>[];
      final candidates = <String, RegExp>{
        'maux de tête':
            RegExp(r'\bmaux\s+de\s+t[êe]te\b', caseSensitive: false),
        'fièvre': RegExp(r'\bfi[eè]vre\b', caseSensitive: false),
        'toux': RegExp(r'\btoux\b', caseSensitive: false),
        'fatigue': RegExp(r'\bfatigue\b', caseSensitive: false),
        'douleur': RegExp(r'\bdouleurs?\b', caseSensitive: false),
        'mal de gorge': RegExp(r'\bmal\s+de\s+gorge\b', caseSensitive: false),
      };
      for (final entry in candidates.entries) {
        if (entry.value.hasMatch(lower)) found.add(entry.key);
      }
      if (found.isNotEmpty) out['symptomes'] = found.join('\n');
    }

    // --- DIAGNOSTIC (multi-items) ---
    final diagnosisRaw = extractSection(
      ['diagnostic', 'diagnostics', 'diagnostique', 'diagnose', 'diagnosis'],
      ['traitement', 'prescris', 'prescrire', 'ordonnance', 'prescription'],
    );
    if (diagnosisRaw != null && diagnosisRaw.length >= 3) {
      final formatted = _formatListItems(diagnosisRaw);
      if (formatted.isNotEmpty) out['diagnostic'] = formatted;
    }

    // Diagnosis synonyms: "il s'agit de ..." / "c'est une ..." / "probablement ..."
    if ((out['diagnostic'] ?? '').trim().isEmpty) {
      final diag2 = extractAfter(
        RegExp(
          r"\b(?:il\s+s'agit\s+de|c'est\s+une|c'est\s+un|probablement|suspicion\s+de|suspecte?|on\s+pense\s+[àa]|compatible\s+avec|[ée]voque|tableau\s+de|sugg[èe]re)\b\s*([^,;]{3,120})",
          caseSensitive: false,
        ),
      );
      if (diag2 != null) out['diagnostic'] = _formatListItems(diag2);
    }

    // Diagnosis keyword fallback (when user doesn't say "diagnostic" clearly).
    if ((out['diagnostic'] ?? '').trim().isEmpty) {
      final found = <String>[];
      final candidates = <String, RegExp>{
        'grippe': RegExp(r'\bgrippe\b', caseSensitive: false),
        'covid-19': RegExp(r'\bcovid\b|\bcovid\s*19\b', caseSensitive: false),
        'gastro-entérite': RegExp(r'\bgastro\b|\bgastro[-\s]?ent[ée]rite\b',
            caseSensitive: false),
        'migraine': RegExp(r'\bmigraine\b', caseSensitive: false),
        'angine': RegExp(r'\bangine\b', caseSensitive: false),
        'infection urinaire': RegExp(r'\binfection\s+urinaire\b|\bcystite\b',
            caseSensitive: false),
      };
      for (final entry in candidates.entries) {
        if (entry.value.hasMatch(lower)) found.add(entry.key);
      }
      if (found.isNotEmpty) out['diagnostic'] = found.join('\n');
    }

    // --- TRAITEMENT / MÉDICAMENTS (multi-items) ---
    final treatmentRaw = extractSection(
          [
            'traitement',
            'médicament',
            'médicaments',
            'medicament',
            'medicaments',
            'ordonnance',
            'prescription',
          ],
          [
            'diagnostic',
            'symptômes',
            'symptomes',
            'température',
            'temperature'
          ],
        ) ??
        extractSection(['prescris', 'prescrire', 'je prescris', 'on prescrit'],
            ['diagnostic', 'symptômes', 'symptomes']) ??
        extractAfter(
          RegExp(
            r"\b(?:traitement\s+par|ordonnance|prescription|m[ée]dicament(?:s)?|on\s+donne|on\s+prescrit|je\s+prescris)\b\s*(.+)",
            caseSensitive: false,
          ),
        );

    if (treatmentRaw != null && treatmentRaw.length >= 3) {
      final formatted = _formatListItems(treatmentRaw);
      if (formatted.isNotEmpty) out['traitement'] = formatted;
    }

    // Treatment synonyms: "on donne ..." / "ordonnance ..." / "médicament ..." / "traitement par ..."
    if ((out['traitement'] ?? '').trim().isEmpty) {
      final tr2 = extractAfter(
        RegExp(
          r"\b(?:traitement\s+par|ordonnance|prescription|m[ée]dicament(?:s)?|on\s+donne|on\s+prescrit|je\s+prescris)\b\s*(.+)",
          caseSensitive: false,
        ),
      );
      if (tr2 != null) out['traitement'] = _formatListItems(tr2);
    }

    return out;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Consultation Intelligente'),
        backgroundColor: Colors.blue.shade700,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.history),
            tooltip: 'Auto-formulaires sauvegardés',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const AutoFormSavedPage()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.save),
            tooltip: 'Sauvegarder',
            onPressed: isProcessing ? null : _saveConsultationOnly,
          ),
          IconButton(
            icon: const Icon(Icons.picture_as_pdf),
            tooltip: 'Exporter PDF',
            onPressed: isProcessing ? null : _exportPdfOnly,
          ),
        ],
      ),
      backgroundColor: Colors.grey.shade50,
      body: Consumer<SttService>(
        builder: (context, stt, _) {
          return SingleChildScrollView(
            padding: const EdgeInsets.only(
                bottom: 100, left: 16, right: 16, top: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // STATUS CARD
                if (stt.isListening || isProcessing)
                  Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: isProcessing
                          ? Colors.blue.shade50
                          : Colors.red.shade50,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isProcessing
                            ? Colors.blue.shade200
                            : Colors.red.shade200,
                      ),
                    ),
                    child: Row(
                      children: [
                        if (isProcessing)
                          const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        else
                          const Icon(Icons.mic, color: Colors.red),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            isProcessing
                                ? '🔄 Analyse intelligente en cours...'
                                : 'Opérateur : "${stt.text}"',
                            style: TextStyle(
                              color: isProcessing
                                  ? Colors.blue.shade800
                                  : Colors.red.shade800,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                // GUIDE CARD
                if (!stt.isListening &&
                    !isProcessing &&
                    nomController.text.isEmpty)
                  Card(
                    color: Colors.blue.shade50,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        children: [
                          const Icon(Icons.auto_awesome,
                              color: Colors.blue, size: 32),
                          const SizedBox(height: 8),
                          Text(
                            "Mode Auto-Remplissage",
                            style: TextStyle(
                                color: Colors.blue.shade900,
                                fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Dictez simplement :\n"Le patient Martin, 45 ans, a de la fièvre et une toux. Je prescris du repos."',
                            textAlign: TextAlign.center,
                            style: TextStyle(color: Colors.blue.shade800),
                          ),
                        ],
                      ),
                    ),
                  ),

                // DETECTED CHIPS (Visualisation)
                if (nomController.text.isNotEmpty ||
                    symptomesController.text.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 12.0),
                    child: Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        if (nomController.text.isNotEmpty)
                          _buildChip('👤 ${nomController.text}',
                              Colors.green.shade100),
                        if (ageController.text.isNotEmpty)
                          _buildChip('🎂 ${ageController.text} ans',
                              Colors.orange.shade100),
                        if (temperatureController.text.isNotEmpty)
                          _buildChip('🌡️ ${temperatureController.text}°C',
                              Colors.red.shade100),
                        if (symptomesController.text.isNotEmpty)
                          _buildChip(
                              '🤒 Symptômes détectés', Colors.purple.shade100),
                      ],
                    ),
                  ),

                const SizedBox(height: 8),

                // FORM
                Card(
                  elevation: 2,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16)),
                  child: Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        buildFormField('Nom complet', nomController),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            Expanded(
                                child: buildFormField('Âge', ageController,
                                    keyboardType: TextInputType.number)),
                            const SizedBox(width: 16),
                            Expanded(
                                child: buildFormField(
                                    'Température (°C)', temperatureController,
                                    keyboardType: TextInputType.number)),
                          ],
                        ),
                        const SizedBox(height: 16),
                        buildFormField('Symptômes', symptomesController,
                            maxLines: 2),
                        const SizedBox(height: 16),
                        buildFormField('Diagnostic', diagnosticController,
                            maxLines: 2),
                        const SizedBox(height: 16),
                        buildFormField(
                            'Traitement / Prescription', traitementController,
                            maxLines: 3),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 24),

                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: isProcessing ? null : _saveConsultationOnly,
                        icon: const Icon(Icons.save),
                        label: const Text('SAUVEGARDER'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green.shade600,
                          foregroundColor: Colors.white,
                          minimumSize: const Size(double.infinity, 56),
                          elevation: 4,
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                          textStyle: const TextStyle(
                              fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: isProcessing ? null : _exportPdfOnly,
                        icon: const Icon(Icons.picture_as_pdf),
                        label: const Text('PDF'),
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size(double.infinity, 56),
                          side: BorderSide(color: Colors.blue.shade700),
                          foregroundColor: Colors.blue.shade700,
                          textStyle: const TextStyle(
                              fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: isProcessing ? null : _clearFormFields,
                        icon: const Icon(Icons.delete_outline),
                        label: const Text('EFFACER'),
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size(double.infinity, 56),
                          side: BorderSide(color: Colors.red.shade400),
                          foregroundColor: Colors.red.shade700,
                          textStyle: const TextStyle(
                              fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
      floatingActionButton: Consumer<SttService>(
        builder: (context, stt, _) {
          final isListening = stt.isListening;
          return FloatingActionButton.large(
            onPressed: isProcessing ? null : () => _toggleVoiceFilling(stt),
            backgroundColor: isListening ? Colors.red : Colors.blue.shade700,
            child: Icon(
              isListening ? Icons.stop_rounded : Icons.mic_rounded,
              size: 40,
              color: Colors.white,
            ),
          );
        },
      ),
    );
  }

  Widget _buildChip(String label, Color color) {
    return Chip(
      label: Text(label,
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
      backgroundColor: color,
      visualDensity: VisualDensity.compact,
      padding: EdgeInsets.zero,
    );
  }

  // Method moved up and simplified

  Future<void> _extractFromText(String text,
      {bool allowBackend = true, bool showSuccessToast = true}) async {
    if (text.trim().isEmpty) return;
    setState(() => isProcessing = true);
    try {
      // Appel backend RAG/IA pour extraction intelligente
      if (allowBackend) {
        final apiService = context.read<ApiService>();
        final ragResult = await apiService.transcribeRag(text);
        if (ragResult != null && ragResult['success'] == true) {
          final rag = ragResult['rag'] ?? {};
          final answer = rag['answer'] ?? '';
          final hits = rag['hits_postgres'] ?? [];
          // Remplissage intelligent des champs à partir de la réponse IA et des hits
          if (answer is String && answer.isNotEmpty) {
            // Peut parser la réponse IA pour extraire les champs (nom, age, symptomes, diagnostic, traitement, temperature)
            // Ici, exemple simple :
            if (answer.contains('Nom du patient')) {
              final nomMatch =
                  RegExp(r'Nom du patient\s*:\s*(.+)').firstMatch(answer);
              if (nomMatch != null) {
                nomController.text = nomMatch.group(1)!.trim();
              }
            }
            if (answer.contains('Âge')) {
              final ageMatch = RegExp(r'Âge\s*:\s*(\d+)').firstMatch(answer);
              if (ageMatch != null) {
                ageController.text = ageMatch.group(1)!.trim();
              }
            }
            if (answer.contains('Température')) {
              final tempMatch =
                  RegExp(r'Température\s*:\s*([\d\.]+)').firstMatch(answer);
              if (tempMatch != null) {
                temperatureController.text = tempMatch.group(1)!.trim();
              }
            }
            if (answer.contains('Symptômes')) {
              final symMatch =
                  RegExp(r'Symptômes\s*:\s*(.+)').firstMatch(answer);
              if (symMatch != null) {
                symptomesController.text = symMatch.group(1)!.trim();
              }
            }
            if (answer.contains('Diagnostic')) {
              final diagMatch =
                  RegExp(r'Diagnostic\s*:\s*(.+)').firstMatch(answer);
              if (diagMatch != null) {
                diagnosticController.text = diagMatch.group(1)!.trim();
              }
            }
            if (answer.contains('Traitement')) {
              final treatMatch =
                  RegExp(r'Traitement\s*:\s*(.+)').firstMatch(answer);
              if (treatMatch != null) {
                traitementController.text = treatMatch.group(1)!.trim();
              }
            }
          }
          // Hits Postgres (si pertinents)
          if (hits is List && hits.isNotEmpty) {
            for (final hit in hits) {
              final notes = hit['notes_medicales'] ?? '';
              final diag = hit['diagnostic'] ?? '';
              final treat = hit['traitement'] ?? '';
              if (notes.isNotEmpty) symptomesController.text = notes;
              if (diag.isNotEmpty) diagnosticController.text = diag;
              if (treat.isNotEmpty) traitementController.text = treat;
            }
          }
          if (showSuccessToast) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('✅ Formulaire auto-rempli par IA/RAG')),
            );
          }
        }
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('❌ Erreur extraction IA/RAG: $e')),
      );
    } finally {
      setState(() => isProcessing = false);
    }
  }
}
