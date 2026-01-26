// Écran d'historique des questions RAG avec export PDF
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:printing/printing.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:intl/intl.dart';
import '../models/rag_history_item.dart';
import '../services/rag_history_database.dart';

class RagHistoryScreen extends StatefulWidget {
  const RagHistoryScreen({super.key});

  @override
  State<RagHistoryScreen> createState() => _RagHistoryScreenState();
}

class _RagHistoryScreenState extends State<RagHistoryScreen> {
  List<RagHistoryItem> _historyItems = [];
  bool _isLoading = true;
  String _selectedCategory = 'Tous';

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    setState(() => _isLoading = true);
    final items = await RagHistoryDatabase.instance.getAll();
    setState(() {
      _historyItems = items;
      _isLoading = false;
    });
  }

  Future<void> _exportToPDF(RagHistoryItem item) async {
    final pdf = pw.Document();

    pdf.addPage(
      pw.Page(
        build: (context) => pw.Column(
          crossAxisAlignment: pw.CrossAxisAlignment.start,
          children: [
            pw.Text(
              'Conseil de Santé Aurian',
              style: pw.TextStyle(fontSize: 24, fontWeight: pw.FontWeight.bold),
            ),
            pw.SizedBox(height: 20),
            pw.Text(
              'Date: ${DateFormat('dd/MM/yyyy HH:mm').format(item.createdAt)}',
              style: const pw.TextStyle(fontSize: 12, color: PdfColors.grey),
            ),
            pw.SizedBox(height: 10),
            pw.Text(
              'Catégorie: ${item.category.toUpperCase()}',
              style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold),
            ),
            pw.SizedBox(height: 20),
            pw.Text('Question:',
                style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
            pw.Text(item.question),
            pw.SizedBox(height: 20),
            pw.Text('Réponse:',
                style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
            pw.Text(item.answer),
            pw.SizedBox(height: 20),
            pw.Divider(),
            pw.Text(
              '⚠️ Ces informations sont fournies à titre indicatif. Consultez toujours un professionnel de santé.',
              style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey),
            ),
          ],
        ),
      ),
    );

    await Printing.layoutPdf(onLayout: (format) => pdf.save());
  }

  IconData _getCategoryIcon(String category) {
    switch (category.toLowerCase()) {
      case 'migraine':
        return FontAwesomeIcons.headSideCough;
      case 'fièvre':
        return FontAwesomeIcons.temperatureHigh;
      case 'toux':
        return FontAwesomeIcons.lungs;
      case 'grippe':
        return FontAwesomeIcons.virus;
      default:
        return FontAwesomeIcons.heartPulse;
    }
  }

  Color _getCategoryColor(String category) {
    switch (category.toLowerCase()) {
      case 'migraine':
        return Colors.deepPurple;
      case 'fièvre':
        return Colors.red;
      case 'toux':
        return Colors.blue;
      case 'grippe':
        return Colors.orange;
      default:
        return Colors.teal;
    }
  }

  @override
  Widget build(BuildContext context) {
    final filteredItems = _selectedCategory == 'Tous'
        ? _historyItems
        : _historyItems.where((i) => i.category == _selectedCategory).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('📜 Historique'),
        actions: [
          if (_historyItems.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.delete_sweep),
              onPressed: () async {
                final confirm = await showDialog<bool>(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text('Effacer l\'historique?'),
                    content: const Text('Cette action est irréversible.'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context, false),
                        child: const Text('Annuler'),
                      ),
                      TextButton(
                        onPressed: () => Navigator.pop(context, true),
                        child: const Text('Effacer'),
                      ),
                    ],
                  ),
                );
                if (confirm == true) {
                  await RagHistoryDatabase.instance.deleteAll();
                  _loadHistory();
                }
              },
              tooltip: 'Tout effacer',
            ),
        ],
      ),
      body: Column(
        children: [
          // Filtres par catégorie
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                'Tous',
                'migraine',
                'fièvre',
                'toux',
                'grippe',
                'général'
              ].map((cat) {
                final isSelected = cat == _selectedCategory;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(cat.capitalize()),
                    selected: isSelected,
                    onSelected: (selected) {
                      setState(() => _selectedCategory = cat);
                    },
                  ),
                );
              }).toList(),
            ),
          ),

          // Liste
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : filteredItems.isEmpty
                    ? const Center(
                        child: Text(
                          'Aucun historique',
                          style: TextStyle(color: Colors.grey),
                        ),
                      )
                    : ListView.builder(
                        itemCount: filteredItems.length,
                        padding: const EdgeInsets.all(16),
                        itemBuilder: (context, index) {
                          final item = filteredItems[index];
                          final icon = _getCategoryIcon(item.category);
                          final color = _getCategoryColor(item.category);

                          return Card(
                            margin: const EdgeInsets.only(bottom: 16),
                            child: ExpansionTile(
                              leading: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: color.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: FaIcon(icon, color: color, size: 20),
                              ),
                              title: Text(
                                item.question,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                    fontWeight: FontWeight.bold),
                              ),
                              subtitle: Text(
                                DateFormat('dd/MM/yyyy HH:mm')
                                    .format(item.createdAt),
                                style: const TextStyle(fontSize: 12),
                              ),
                              children: [
                                Padding(
                                  padding: const EdgeInsets.all(16),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(12),
                                        decoration: BoxDecoration(
                                          color: color.withOpacity(0.05),
                                          borderRadius:
                                              BorderRadius.circular(8),
                                        ),
                                        child: Text(item.answer),
                                      ),
                                      const SizedBox(height: 12),
                                      Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.end,
                                        children: [
                                          TextButton.icon(
                                            onPressed: () => _exportToPDF(item),
                                            icon: const Icon(
                                                Icons.picture_as_pdf),
                                            label: const Text('PDF'),
                                          ),
                                          TextButton.icon(
                                            onPressed: () async {
                                              await RagHistoryDatabase.instance
                                                  .delete(item.id!);
                                              _loadHistory();
                                            },
                                            icon: const Icon(Icons.delete),
                                            label: const Text('Supprimer'),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}

extension StringExtension on String {
  String capitalize() {
    return isEmpty ? this : '${this[0].toUpperCase()}${substring(1)}';
  }
}
