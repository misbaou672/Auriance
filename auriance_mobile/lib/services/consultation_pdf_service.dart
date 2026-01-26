import 'package:flutter/foundation.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:intl/intl.dart';
import 'file_storage_service.dart';

/// Service pour générer et sauvegarder les PDFs de consultation
class ConsultationPdfService {
  /// Génère et sauvegarde un PDF de consultation dans le dossier Téléchargements
  /// Génère les bytes du PDF sans sauvegarder
  static Future<Uint8List> generatePdfBytes({
    required String transcription,
    String? nom,
    String? prenom,
    String? dateNaissance,
    String? genre,
    String? symptomes,
    String? diagnostic,
    String? traitement,
  }) async {
    // Créer le document PDF
    final pdf = pw.Document();

    // Ajouter la page avec les données de consultation
    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(32),
        build: (pw.Context context) => _buildPdfContent(
          transcription: transcription,
          nom: nom,
          prenom: prenom,
          dateNaissance: dateNaissance,
          genre: genre,
          symptomes: symptomes,
          diagnostic: diagnostic,
          traitement: traitement,
        ),
      ),
    );

    return await pdf.save();
  }

  /// Génère et sauvegarde le PDF
  /// Retourne le chemin du fichier sauvegardé
  static Future<String> generateAndSavePdf({
    required String transcription,
    String? nom,
    String? prenom,
    String? age,
    String? genre,
    String? symptomes,
    String? diagnostic,
    String? traitement,
  }) async {
    final bytes = await generatePdfBytes(
      transcription: transcription,
      nom: nom,
      prenom: prenom,
      genre: genre,
      symptomes: symptomes,
      diagnostic: diagnostic,
      traitement: traitement,
    );

    final filePath =
        await FileStorageService().savePdf(bytes, type: 'formulaire');

    return filePath;
  }

  /// Construit le contenu du PDF
  static List<pw.Widget> _buildPdfContent({
    required String transcription,
    String? nom,
    String? prenom,
    String? dateNaissance,
    String? genre,
    String? symptomes,
    String? diagnostic,
    String? traitement,
  }) {
    return [
      // En-tête
      pw.Header(
        level: 0,
        child: pw.Column(
          crossAxisAlignment: pw.CrossAxisAlignment.start,
          children: [
            pw.Text(
              'AURIANCE - Consultation Médicale',
              style: pw.TextStyle(
                fontSize: 24,
                fontWeight: pw.FontWeight.bold,
                color: PdfColors.blue800,
              ),
            ),
            pw.SizedBox(height: 8),
            pw.Divider(color: PdfColors.blue800),
            pw.SizedBox(height: 16),
            pw.Text(
              'Date: ${DateFormat('dd/MM/yyyy HH:mm').format(DateTime.now())}',
              style: const pw.TextStyle(fontSize: 12, color: PdfColors.grey700),
            ),
          ],
        ),
      ),

      pw.SizedBox(height: 24),

      // Informations Patient
      if (nom != null ||
          prenom != null ||
          dateNaissance != null ||
          genre != null) ...[
        _buildSection('Informations Patient'),
        if (nom != null && nom.isNotEmpty) _buildField('Nom', nom),
        if (prenom != null && prenom.isNotEmpty) _buildField('Prénom', prenom),
        if (dateNaissance != null && dateNaissance.isNotEmpty)
          _buildField('Date de naissance', dateNaissance),
        if (genre != null && genre.isNotEmpty) _buildField('Genre', genre),
        pw.SizedBox(height: 16),
      ],

      // Symptômes
      if (symptomes != null && symptomes.isNotEmpty) ...[
        _buildSection('Symptômes'),
        _buildField('', symptomes),
        pw.SizedBox(height: 16),
      ],

      // Diagnostic
      if (diagnostic != null && diagnostic.isNotEmpty) ...[
        _buildSection('Diagnostic'),
        _buildField('', diagnostic),
        pw.SizedBox(height: 16),
      ],

      // Traitement
      if (traitement != null && traitement.isNotEmpty) ...[
        _buildSection('Traitement'),
        _buildField('', traitement),
        pw.SizedBox(height: 16),
      ],

      // Transcription complète
      if (transcription.isNotEmpty) ...[
        _buildSection('Transcription Complète'),
        pw.Container(
          padding: const pw.EdgeInsets.all(12),
          decoration: pw.BoxDecoration(
            color: PdfColors.grey100,
            borderRadius: const pw.BorderRadius.all(pw.Radius.circular(8)),
          ),
          child: pw.Text(
            transcription,
            style: const pw.TextStyle(fontSize: 11, color: PdfColors.grey800),
          ),
        ),
      ],

      // Footer
      pw.SizedBox(height: 32),
      pw.Divider(color: PdfColors.grey400),
      pw.SizedBox(height: 8),
      pw.Text(
        'Document généré automatiquement par AURIANCE',
        style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey600),
        textAlign: pw.TextAlign.center,
      ),
    ];
  }

  /// Widget pour créer une section avec titre
  static pw.Widget _buildSection(String title) {
    return pw.Container(
      margin: const pw.EdgeInsets.only(bottom: 8),
      child: pw.Text(
        title,
        style: pw.TextStyle(
          fontSize: 16,
          fontWeight: pw.FontWeight.bold,
          color: PdfColors.blue700,
        ),
      ),
    );
  }

  /// Widget pour créer un champ avec label et valeur
  static pw.Widget _buildField(String label, String value) {
    if (label.isEmpty) {
      return pw.Container(
        padding: const pw.EdgeInsets.all(8),
        margin: const pw.EdgeInsets.only(bottom: 4),
        child: pw.Text(
          value,
          style: const pw.TextStyle(fontSize: 12),
        ),
      );
    }

    return pw.Container(
      padding: const pw.EdgeInsets.all(8),
      margin: const pw.EdgeInsets.only(bottom: 4),
      child: pw.Row(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.SizedBox(
            width: 100,
            child: pw.Text(
              '$label:',
              style: pw.TextStyle(
                fontSize: 12,
                fontWeight: pw.FontWeight.bold,
              ),
            ),
          ),
          pw.Expanded(
            child: pw.Text(
              value,
              style: const pw.TextStyle(fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }

  /// Sauvegarde les bytes du PDF dans le dossier approprié
  /// Type: 'formulaire' ou 'transcription'
  /// Retourne le chemin du fichier sauvegardé
  static Future<String> savePdfToStorage(Uint8List bytes,
      {String type = 'formulaire'}) async {
    try {
      return await FileStorageService().savePdf(bytes, type: type);
    } catch (e) {
      if (kDebugMode) {
        print('Erreur sauvegarde PDF: $e');
      }
      rethrow;
    }
  }
}
