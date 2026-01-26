"""CRUD operations for reports and queries"""
from sqlalchemy.orm import Session
from app.db.models import Report, SQLQuery, CypherQuery
from app.schemas import ReportCreate, SQLQueryCreate, CypherQueryCreate


# ===== REPORT CRUD =====
def create_report(db: Session, report: ReportCreate, user_id: int) -> Report:
    """Create a new report"""
    db_report = Report(
        transcription_id=report.transcription_id,
        user_id=user_id,
        report_type=report.report_type,
        title=report.title,
        content=report.content,
        format=report.format
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report


def get_report(db: Session, report_id: int) -> Report:
    """Get report by ID"""
    return db.query(Report).filter(Report.id == report_id).first()


def get_user_reports(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """Get all reports for a user"""
    return db.query(Report).filter(Report.user_id == user_id).offset(skip).limit(limit).all()


def delete_report(db: Session, report_id: int) -> bool:
    """Delete report"""
    db_report = get_report(db, report_id)
    if db_report:
        db.delete(db_report)
        db.commit()
        return True
    return False


# ===== SQL QUERY CRUD =====
def create_sql_query(db: Session, query: SQLQueryCreate) -> SQLQuery:
    """Create a new SQL query"""
    db_query = SQLQuery(
        extraction_id=query.extraction_id,
        query=query.query,
        action_type=query.action_type,
        table_name=query.table_name
    )
    db.add(db_query)
    db.commit()
    db.refresh(db_query)
    return db_query


def get_sql_query(db: Session, query_id: int) -> SQLQuery:
    """Get SQL query by ID"""
    return db.query(SQLQuery).filter(SQLQuery.id == query_id).first()


def get_extraction_sql_queries(db: Session, extraction_id: int):
    """Get all SQL queries for an extraction"""
    return db.query(SQLQuery).filter(SQLQuery.extraction_id == extraction_id).all()


def update_sql_query_execution(db: Session, query_id: int, execution_result: dict) -> SQLQuery:
    """Update SQL query execution result"""
    db_query = get_sql_query(db, query_id)
    if db_query:
        db_query.is_executed = True
        db_query.execution_result = execution_result
        db.commit()
        db.refresh(db_query)
    return db_query


# ===== CYPHER QUERY CRUD =====
def create_cypher_query(db: Session, query: CypherQueryCreate) -> CypherQuery:
    """Create a new Cypher query"""
    db_query = CypherQuery(
        extraction_id=query.extraction_id,
        query=query.query,
        action_type=query.action_type
    )
    db.add(db_query)
    db.commit()
    db.refresh(db_query)
    return db_query


def get_cypher_query(db: Session, query_id: int) -> CypherQuery:
    """Get Cypher query by ID"""
    return db.query(CypherQuery).filter(CypherQuery.id == query_id).first()


def get_extraction_cypher_queries(db: Session, extraction_id: int):
    """Get all Cypher queries for an extraction"""
    return db.query(CypherQuery).filter(CypherQuery.extraction_id == extraction_id).all()


def update_cypher_query_execution(db: Session, query_id: int, execution_result: dict) -> CypherQuery:
    """Update Cypher query execution result"""
    db_query = get_cypher_query(db, query_id)
    if db_query:
        db_query.is_executed = True
        db_query.execution_result = execution_result
        db.commit()
        db.refresh(db_query)
    return db_query
