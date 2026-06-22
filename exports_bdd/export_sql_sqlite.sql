-- =============================================
-- AURIANCE - Export Base de Données SQL (SQLite)
-- Date: 2026-03-01
-- Base: auriance.db
-- =============================================

-- Table: cypher_queries
CREATE TABLE cypher_queries (
	id INTEGER NOT NULL, 
	extraction_id INTEGER NOT NULL, 
	"query" TEXT NOT NULL, 
	action_type VARCHAR(50), 
	is_executed BOOLEAN, 
	execution_result JSON, 
	created_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(extraction_id) REFERENCES extractions (id)
);

-- 0 enregistrement(s)

-- Table: extractions
CREATE TABLE extractions (
	id INTEGER NOT NULL, 
	transcription_id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	full_name VARCHAR(255), 
	email VARCHAR(255), 
	phone VARCHAR(20), 
	date_of_birth VARCHAR(20), 
	address TEXT, 
	age INTEGER, 
	extra_fields JSON, 
	form_type VARCHAR(50), 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME, 
	PRIMARY KEY (id), 
	UNIQUE (transcription_id), 
	FOREIGN KEY(transcription_id) REFERENCES transcriptions (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);

-- 0 enregistrement(s)

-- Table: medical_searches
CREATE TABLE medical_searches (
	id INTEGER NOT NULL, 
	user_id INTEGER, 
	"query" TEXT NOT NULL, 
	results JSON, 
	advice JSON, 
	created_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);

-- 0 enregistrement(s)

-- Table: rag_queries
CREATE TABLE rag_queries (
	id INTEGER NOT NULL, 
	user_id INTEGER, 
	question TEXT NOT NULL, 
	answer TEXT NOT NULL, 
	hits_count INTEGER, 
	hits_data JSON, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id)
);

-- 0 enregistrement(s)

-- Table: reports
CREATE TABLE reports (
	id INTEGER NOT NULL, 
	transcription_id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	report_type VARCHAR(50) NOT NULL, 
	title VARCHAR(500) NOT NULL, 
	content TEXT NOT NULL, 
	format VARCHAR(20), 
	file_path VARCHAR(500), 
	created_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(transcription_id) REFERENCES transcriptions (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);

-- 0 enregistrement(s)

-- Table: sql_queries
CREATE TABLE sql_queries (
	id INTEGER NOT NULL, 
	extraction_id INTEGER NOT NULL, 
	"query" TEXT NOT NULL, 
	action_type VARCHAR(50), 
	table_name VARCHAR(100), 
	is_executed BOOLEAN, 
	execution_result JSON, 
	created_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(extraction_id) REFERENCES extractions (id)
);

-- 0 enregistrement(s)

-- Table: transcriptions
CREATE TABLE transcriptions (
	id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	audio_file_path VARCHAR(500), 
	text TEXT NOT NULL, 
	language VARCHAR(10), 
	duration_seconds INTEGER, 
	confidence_score INTEGER, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);

-- 0 enregistrement(s)

-- Table: users
CREATE TABLE users (
	id INTEGER NOT NULL, 
	username VARCHAR(255) NOT NULL, 
	email VARCHAR(255) NOT NULL, 
	hashed_password VARCHAR(255) NOT NULL, 
	full_name VARCHAR(255), 
	is_active BOOLEAN, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME, 
	PRIMARY KEY (id)
);

-- 0 enregistrement(s)
