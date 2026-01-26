import 'package:flutter/material.dart';
import '../constants/app_theme.dart';
import '../models/transcription_models.dart';

/// Widget de sélection de langue pour la traduction
class LanguageSelector extends StatefulWidget {
  final Function(String) onLanguageSelected;
  final String selectedLanguageCode;
  final List<LanguageInfo> languages;
  final String title;

  const LanguageSelector({
    super.key,
    required this.onLanguageSelected,
    this.selectedLanguageCode = 'en',
    required this.languages,
    this.title = 'Sélectionner une langue',
  });

  @override
  State<LanguageSelector> createState() => _LanguageSelectorState();
}

class _LanguageSelectorState extends State<LanguageSelector> {
  late String _selectedLanguage;

  @override
  void initState() {
    super.initState();
    _selectedLanguage = widget.selectedLanguageCode;
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          widget.title,
          style: Theme.of(context).textTheme.titleMedium,
        ),
        SizedBox(height: AppSpacing.sm),
        Container(
          decoration: BoxDecoration(
            border: Border.all(color: Color(AppColors.borderValue)),
            borderRadius: BorderRadius.circular(8),
          ),
          child: DropdownButton<String>(
            isExpanded: true,
            value: _selectedLanguage,
            underline: const SizedBox.shrink(),
            padding: EdgeInsets.symmetric(horizontal: AppSpacing.md),
            items: widget.languages.map((lang) {
              return DropdownMenuItem(
                value: lang.code,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      lang.name,
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    Text(
                      '${lang.nativeName} • ${lang.speakers ~/ 1000000}M',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Color(AppColors.textTertiaryValue),
                          ),
                    ),
                  ],
                ),
              );
            }).toList(),
            onChanged: (String? value) {
              if (value != null) {
                setState(() {
                  _selectedLanguage = value;
                });
                widget.onLanguageSelected(value);
              }
            },
          ),
        ),
      ],
    );
  }
}

/// Affichage des informations de langues supportées
class LanguageInfoCard extends StatelessWidget {
  final LanguageInfo language;

  const LanguageInfoCard({
    super.key,
    required this.language,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.only(bottom: AppSpacing.sm),
      child: Padding(
        padding: EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        language.name,
                        style: Theme.of(context).textTheme.titleSmall,
                      ),
                      SizedBox(height: AppSpacing.xs),
                      Text(
                        language.nativeName,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Color(AppColors.textTertiaryValue),
                            ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                    vertical: AppSpacing.xs,
                  ),
                  decoration: BoxDecoration(
                    color: Color(AppColors.primaryValue).withAlpha(30),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    language.code.toUpperCase(),
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Color(AppColors.primaryValue),
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                ),
              ],
            ),
            SizedBox(height: AppSpacing.xs),
            Row(
              children: [
                Icon(
                  Icons.people,
                  size: 14,
                  color: Color(AppColors.textTertiaryValue),
                ),
                SizedBox(width: AppSpacing.xs),
                Text(
                  '${language.speakers ~/ 1000000} millions de locuteurs',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Color(AppColors.textTertiaryValue),
                      ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
