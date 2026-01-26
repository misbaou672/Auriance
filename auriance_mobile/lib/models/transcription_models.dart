/// Transcription model
class Transcription {
  final int id;
  final int userId;
  final String audioFilePath;
  final String text;
  final String language;
  final double? durationSeconds;
  final double? confidenceScore;
  final DateTime createdAt;
  final DateTime? updatedAt;

  Transcription({
    required this.id,
    required this.userId,
    required this.audioFilePath,
    required this.text,
    required this.language,
    this.durationSeconds,
    this.confidenceScore,
    required this.createdAt,
    this.updatedAt,
  });

  factory Transcription.fromJson(Map<String, dynamic> json) {
    final createdAtRaw = json['created_at'] as String?;
    final updatedAtRaw = json['updated_at'] as String?;
    return Transcription(
      id: json['id'] as int? ?? 0,
      userId: json['user_id'] as int? ?? 0,
      audioFilePath: json['audio_file_path'] as String? ?? '',
      text: json['text'] as String? ?? '',
      language: json['language'] as String? ?? 'fr',
      durationSeconds: (json['duration_seconds'] as num?)?.toDouble(),
      confidenceScore: (json['confidence_score'] as num?)?.toDouble(),
      createdAt: createdAtRaw != null
          ? DateTime.tryParse(createdAtRaw) ?? DateTime.now()
          : DateTime.now(),
      updatedAt: updatedAtRaw != null ? DateTime.tryParse(updatedAtRaw) : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'user_id': userId,
        'audio_file_path': audioFilePath,
        'text': text,
        'language': language,
        'duration_seconds': durationSeconds,
        'confidence_score': confidenceScore,
        'created_at': createdAt.toIso8601String(),
        if (updatedAt != null) 'updated_at': updatedAt!.toIso8601String(),
      };
}

/// Create Transcription Request
class CreateTranscriptionRequest {
  final String text;
  final String language;
  final double? durationSeconds;
  final double? confidenceScore;
  final String? audioFilePath;

  CreateTranscriptionRequest({
    required this.text,
    required this.language,
    this.durationSeconds,
    this.confidenceScore,
    this.audioFilePath,
  });

  Map<String, dynamic> toJson() => {
        'text': text,
        'language': language,
        'duration_seconds': durationSeconds,
        'confidence_score': confidenceScore,
        'audio_file_path': audioFilePath,
      };
}

/// Extraction model (extracted info from transcription)
class Extraction {
  final int id;
  final int transcriptionId;
  final int userId;
  final String? fullName;
  final String? email;
  final String? phone;
  final String? dateOfBirth;
  final String? address;
  final int? age;
  final String formType;
  final Map<String, dynamic>? extraFields;

  Extraction({
    required this.id,
    required this.transcriptionId,
    required this.userId,
    this.fullName,
    this.email,
    this.phone,
    this.dateOfBirth,
    this.address,
    this.age,
    required this.formType,
    this.extraFields,
  });

  factory Extraction.fromJson(Map<String, dynamic> json) {
    return Extraction(
      id: json['id'] as int,
      transcriptionId: json['transcription_id'] as int,
      userId: json['user_id'] as int,
      fullName: json['full_name'] as String?,
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      dateOfBirth: json['date_of_birth'] as String?,
      address: json['address'] as String?,
      age: json['age'] as int?,
      formType: json['form_type'] as String? ?? '',
      extraFields: json['extra_fields'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() => {
        'transcription_id': transcriptionId,
        'full_name': fullName,
        'email': email,
        'phone': phone,
        'date_of_birth': dateOfBirth,
        'address': address,
        'age': age,
        'form_type': formType,
        'extra_fields': extraFields,
      };
}

/// Report model
class Report {
  final int id;
  final int transcriptionId;
  final int userId;
  final String reportType;
  final String title;
  final String content;
  final String format;
  final String? filePath;
  final DateTime createdAt;

  Report({
    required this.id,
    required this.transcriptionId,
    required this.userId,
    required this.reportType,
    required this.title,
    required this.content,
    required this.format,
    this.filePath,
    required this.createdAt,
  });

  factory Report.fromJson(Map<String, dynamic> json) {
    return Report(
      id: json['id'] as int,
      transcriptionId: json['transcription_id'] as int,
      userId: json['user_id'] as int,
      reportType: json['report_type'] as String? ?? '',
      title: json['title'] as String? ?? '',
      content: json['content'] as String? ?? '',
      format: json['format'] as String? ?? 'json',
      filePath: json['file_path'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'transcription_id': transcriptionId,
        'user_id': userId,
        'report_type': reportType,
        'title': title,
        'content': content,
        'format': format,
        'file_path': filePath,
        'created_at': createdAt.toIso8601String(),
      };
}

/// Create Report Request
class CreateReportRequest {
  final int transcriptionId;
  final String reportType;
  final String title;
  final String content;
  final String format;

  CreateReportRequest({
    required this.transcriptionId,
    required this.reportType,
    required this.title,
    required this.content,
    this.format = 'json',
  });

  Map<String, dynamic> toJson() => {
        'transcription_id': transcriptionId,
        'report_type': reportType,
        'title': title,
        'content': content,
        'format': format,
      };
}

/// Translation model
class Translation {
  final String originalText;
  final String originalLanguage;
  final String translatedText;
  final String targetLanguage;
  final String provider;
  final double confidence;
  final DateTime createdAt;

  Translation({
    required this.originalText,
    required this.originalLanguage,
    required this.translatedText,
    required this.targetLanguage,
    required this.provider,
    this.confidence = 0.0,
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();

  factory Translation.fromJson(Map<String, dynamic> json) {
    return Translation(
      originalText: json['original_text'] as String? ?? '',
      originalLanguage: json['original_language'] as String? ?? 'en',
      translatedText: json['translated_text'] as String? ?? '',
      targetLanguage: json['target_language'] as String? ?? 'en',
      provider: json['provider'] as String? ?? 'unknown',
      confidence: (json['confidence'] as num?)?.toDouble() ?? 0.0,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'original_text': originalText,
        'original_language': originalLanguage,
        'translated_text': translatedText,
        'target_language': targetLanguage,
        'provider': provider,
        'confidence': confidence,
        'created_at': createdAt.toIso8601String(),
      };
}

/// Supported Language Info
class LanguageInfo {
  final String code;
  final String name;
  final String nativeName;
  final int speakers;

  LanguageInfo({
    required this.code,
    required this.name,
    required this.nativeName,
    required this.speakers,
  });

  factory LanguageInfo.fromJson(Map<String, dynamic> json) {
    return LanguageInfo(
      code: json['code'] as String? ?? '',
      name: json['name'] as String? ?? '',
      nativeName: json['native_name'] as String? ?? '',
      speakers: json['speakers'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'code': code,
        'name': name,
        'native_name': nativeName,
        'speakers': speakers,
      };

  @override
  String toString() => '$name ($code) - ${speakers ~/ 1000000}M locuteurs';
}
