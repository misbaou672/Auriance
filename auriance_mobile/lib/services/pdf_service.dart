import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:path_provider/path_provider.dart';
import 'package:file_saver/file_saver.dart';

import 'file_storage_service.dart';

import 'package:pdf/widgets.dart' as pw;
import 'package:pdf/pdf.dart' as pdf;
// Using default PDF fonts. For full Unicode support, we'll switch to
// embedded fonts loaded from assets in a subsequent step.

/// Simple PDF export utility for transcriptions
class PdfService {
  /// Sauvegarde un PDF à partir de bytes (généré côté backend)
  static Future<String> savePdfBytes(List<int> bytes,
      {String fileName = 'formulaire_medical_backend.pdf'}) async {
    // Prefer explicit Android/media/<package>/pdfs when possible.
    try {
      final dir = await FileStorageService().getPdfsDirectory();
      final filePath = '${dir.path}/$fileName';
      final file = File(filePath);
      await file.writeAsBytes(bytes);
      return filePath;
    } catch (e) {
      // Fall back to system file saver.
      try {
        final base =
            fileName.replaceAll(RegExp(r'\.pdf$', caseSensitive: false), '');
        final savedPath = await FileSaver.instance.saveFile(
          name: base,
          bytes: Uint8List.fromList(bytes),
          fileExtension: 'pdf',
          mimeType: MimeType.pdf,
        );
        if (savedPath.isNotEmpty) return savedPath;
      } catch (_) {}

      // Final fallback: app documents
      final dir = await getApplicationDocumentsDirectory();
      final filePath = '${dir.path}/$fileName';
      final file = File(filePath);
      await file.writeAsBytes(bytes);
      return filePath;
    }
  }

  /// Saves the provided text as a PDF in the app documents directory.
  /// Returns the saved file path.
  static Future<String> saveTranscriptionPdf({
    required String text,
    required String title,
    String? languageCode,
    String logoAssetPath = 'assets/images/logo.png',
    bool preferDownloads = false,
    bool preferAppMedia = false,
  }) async {
    try {
      final Uint8List? logoBytes = await _tryLoadAsset(logoAssetPath);
      final logo = (logoBytes != null && logoBytes.isNotEmpty)
          ? pw.MemoryImage(logoBytes)
          : null;

      // Try to load Unicode-capable fonts from assets if available.
      final pw.Font? baseFont =
          await _tryLoadTtfFont('assets/fonts/NotoSans-Regular.ttf');
      final pw.Font? boldFont =
          await _tryLoadTtfFont('assets/fonts/NotoSans-Bold.ttf');
      final pw.Font? italicFont =
          await _tryLoadTtfFont('assets/fonts/NotoSans-Italic.ttf');
      // Preload possible fallbacks per language family
      final Map<String, pw.Font?> langFallbacks = {
        // CJK (Chinese, Japanese, Korean)
        'ko': await _tryLoadTtfFont('assets/fonts/NotoSansKR-Regular.ttf'),
        'ja': await _tryLoadTtfFont('assets/fonts/NotoSansJP-Regular.ttf'),
        'zh': await _tryLoadTtfFont('assets/fonts/NotoSansSC-Regular.ttf'),
        // South Asian
        'ta': await _tryLoadTtfFont('assets/fonts/NotoSansTamil-Regular.ttf'),
        'hi': await _tryLoadTtfFont(
            'assets/fonts/NotoSansDevanagari-Regular.ttf'),
        'bn': await _tryLoadTtfFont('assets/fonts/NotoSansBengali-Regular.ttf'),
        // Middle Eastern
        'ar': await _tryLoadTtfFont('assets/fonts/NotoSansArabic-Regular.ttf'),
        'he': await _tryLoadTtfFont('assets/fonts/NotoSansHebrew-Regular.ttf'),
        // Southeast Asian
        'th': await _tryLoadTtfFont('assets/fonts/NotoSansThai-Regular.ttf'),
      };

      final doc = (baseFont != null)
          ? pw.Document(
              theme: pw.ThemeData.withFont(
                base: baseFont,
                bold: boldFont ?? baseFont,
                italic: italicFont ?? baseFont,
              ),
            )
          : pw.Document();
      doc.addPage(
        pw.MultiPage(
          pageTheme: pw.PageTheme(
            margin: const pw.EdgeInsets.all(32),
            buildBackground: (context) => pw.Stack(
              children: [
                pw.Positioned.fill(
                  child: pw.Opacity(
                    opacity: 0.18, // stronger but still subtle
                    child: logo != null
                        ? pw.Image(logo, fit: pw.BoxFit.cover)
                        : pw.Center(
                            child: pw.Transform.rotate(
                              angle: -0.4,
                              child: pw.Text(
                                'AURIANCE',
                                style: pw.TextStyle(
                                  fontSize: 72,
                                  color: pdf.PdfColors.grey600,
                                ),
                              ),
                            ),
                          ),
                  ),
                ),
              ],
            ),
          ),
          build: (_) => [
            pw.Text(title,
                style:
                    pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold)),
            pw.SizedBox(height: 16),
            pw.Text(
              text,
              style: pw.TextStyle(
                fontSize: 12,
                // Use base font as primary to avoid rendering boxes for missing CJK fonts
                font: baseFont,
                // Provide fallback fonts for all supported scripts
                fontFallback: [
                  // Primary: use detected language font first
                  if (languageCode != null &&
                      langFallbacks[languageCode] != null)
                    langFallbacks[languageCode]!,
                  // CJK fallbacks
                  if (langFallbacks['zh'] != null) langFallbacks['zh']!,
                  if (langFallbacks['ja'] != null) langFallbacks['ja']!,
                  if (langFallbacks['ko'] != null) langFallbacks['ko']!,
                  // South Asian fallbacks
                  if (langFallbacks['ta'] != null) langFallbacks['ta']!,
                  if (langFallbacks['hi'] != null) langFallbacks['hi']!,
                  if (langFallbacks['bn'] != null) langFallbacks['bn']!,
                  // Middle Eastern fallbacks
                  if (langFallbacks['ar'] != null) langFallbacks['ar']!,
                  if (langFallbacks['he'] != null) langFallbacks['he']!,
                  // Southeast Asian fallbacks
                  if (langFallbacks['th'] != null) langFallbacks['th']!,
                ],
              ),
            ),
          ],
        ),
      );

      final bytes = await doc.save();
      final safeTitle = title.replaceAll(RegExp(r'[^a-zA-Z0-9_-]+'), '_');
      final fileBase = safeTitle.isEmpty ? 'transcription' : safeTitle;
      final stamp = DateTime.now().millisecondsSinceEpoch;
      final suffix = (languageCode != null && languageCode.isNotEmpty)
          ? '_$languageCode'
          : '';
      final fileName = '$fileBase${suffix}_$stamp';

      // 1. Check if we should prefer the App Media directory (Android/media)
      if (preferAppMedia) {
        try {
          final dir = await FileStorageService().getPdfsDirectory();
          final filePath = '${dir.path}/$fileName.pdf';
          final file = File(filePath);
          await file.writeAsBytes(bytes);
          return filePath;
        } catch (e) {
          if (kDebugMode) {
            debugPrint(
                'Preferred media save failed: $e, falling back to FileSaver');
          }
        }
      }

      // 2. Try System File Saver (Best for Android 10+ and user choice)
      try {
        final savedPath = await FileSaver.instance.saveFile(
          name: fileName,
          bytes: bytes,
          fileExtension: 'pdf',
          mimeType: MimeType.pdf,
        );
        if (savedPath.isNotEmpty) {
          return savedPath;
        }
      } catch (e) {
        if (kDebugMode) {
          debugPrint('FileSaver failed: $e, falling back to manual write');
        }
      }

      // 3. Fallback: Application Documents Directory (Always safe, internal)
      final dir = await getApplicationDocumentsDirectory();
      final filePath = '${dir.path}/$fileName.pdf';
      final file = File(filePath);
      await file.writeAsBytes(bytes);
      return filePath;
    } catch (e, stack) {
      if (kDebugMode) {
        debugPrint('Erreur PDF: $e\n$stack');
      }
      rethrow;
    }
  }

  static Future<pw.Font?> _tryLoadTtfFont(String assetPath) async {
    try {
      final data = await rootBundle.load(assetPath);
      return pw.Font.ttf(data);
    } catch (_) {
      return null;
    }
  }

  static Future<Uint8List?> _tryLoadAsset(String path) async {
    try {
      final data = await rootBundle.load(path);
      return data.buffer.asUint8List();
    } catch (_) {
      return null;
    }
  }

  // NOTE: Explicit Android/media/<package>/pdfs resolution is handled centrally
  // by FileStorageService.getPdfsDirectory().
}
