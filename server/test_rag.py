#!/usr/bin/env python
"""Test RAG implementation."""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'japaguide.settings')
django.setup()

from ai.services import ai_service

# Test 1: Document retrieval
print("=" * 60)
print("TEST 1: Document Retrieval")
print("=" * 60)

docs = ai_service.retrieve_documents('How can I work in Canada?')
print(f"\nFound {len(docs)} documents for 'How can I work in Canada?'")
for d in docs:
    print(f"  - {d['country_name']}: {d['title']} ({d['doc_type']})")
    print(f"    Source: {d['source']}, Confidence: {d['confidence']}")

# Test 2: Country extraction
print("\n" + "=" * 60)
print("TEST 2: Country Extraction")
print("=" * 60)

test_messages = [
    "Tell me about working in the UK",
    "What are the visa requirements for USA?",
    "Compare Canada and Australia for immigration",
    "How to get permanent residency in Germany",
]

for msg in test_messages:
    countries = ai_service._extract_countries_from_message(msg)
    print(f"  '{msg}' -> {countries}")

# Test 3: Doc type extraction
print("\n" + "=" * 60)
print("TEST 3: Doc Type Extraction")
print("=" * 60)

test_messages = [
    "How to get a work visa?",
    "Student visa requirements",
    "Family reunification process",
    "How to become a citizen?",
    "General overview of immigration",
]

for msg in test_messages:
    doc_types = ai_service._extract_doc_types_from_message(msg)
    print(f"  '{msg}' -> {doc_types}")

# Test 4: Full chat with RAG (optional - requires API)
print("\n" + "=" * 60)
print("TEST 4: Full Chat with RAG (document retrieval only)")
print("=" * 60)

# Just test the retrieval part of chat
message = "What are the work visa options in Canada?"
country_codes = ai_service._extract_countries_from_message(message)
doc_types = ai_service._extract_doc_types_from_message(message)
docs = ai_service.retrieve_documents(message)

print(f"\nMessage: {message}")
print(f"Countries detected: {country_codes}")
print(f"Doc types detected: {doc_types}")
print(f"Documents retrieved: {len(docs)}")
for d in docs:
    print(f"  - {d['title']}")
    print(f"    Preview: {d['content'][:200]}...")

print("\n" + "=" * 60)
print("RAG Implementation Tests Complete!")
print("=" * 60)
