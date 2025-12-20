"""
Quick test script to verify roadmap serializer output matches frontend expectations.
Run with: python test_roadmap_serializer.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'japaguide.settings')
django.setup()

from roadmaps.models import Roadmap, RoadmapStep, RoadmapStepStatus
from roadmaps.serializers import RoadmapDetailSerializer, RoadmapStepSerializer
import json

# Get a roadmap if exists
roadmap = Roadmap.objects.first()

if roadmap:
    print("=" * 80)
    print("TESTING ROADMAP SERIALIZER OUTPUT")
    print("=" * 80)
    
    serializer = RoadmapDetailSerializer(roadmap)
    data = serializer.data
    
    print("\n✓ Roadmap Fields:")
    print(f"  - id: {data.get('id')}")
    print(f"  - title: {data.get('title')}")
    print(f"  - ai_tone: {data.get('ai_tone')}")
    print(f"  - ai_personality: {data.get('ai_personality')} ← Should match ai_tone")
    print(f"  - country: {data.get('country')}")
    print(f"  - country_code: {data.get('country_code')}")
    print(f"  - country_name: {data.get('country_name')}")
    
    if data.get('steps'):
        step = data['steps'][0]
        print(f"\n✓ RoadmapStep Fields (first step):")
        print(f"  - id: {step.get('id')}")
        print(f"  - title: {step.get('title')}")
        print(f"  - estimated_time: {step.get('estimated_time')} ← Should be string like '2 weeks'")
        print(f"  - estimated_cost: {step.get('estimated_cost')} ← Should be number")
        print(f"  - ai_advice: {step.get('ai_advice', 'None')[:50] if step.get('ai_advice') else 'None'} ← Should exist")
        print(f"  - documents_needed: {step.get('documents_needed')} ← Should be list")
        print(f"  - tips: {len(step.get('tips', []))} items")
        print(f"  - pitfalls: {len(step.get('pitfalls', []))} items")
        
        if step.get('status'):
            status = step['status']
            print(f"\n✓ RoadmapStepStatus Fields:")
            print(f"  - is_complete: {status.get('is_complete')} ← Should exist (not 'completed')")
            print(f"  - is_blocked: {status.get('is_blocked')} ← Should exist (not 'blocked')")
            print(f"  - block_reason: {status.get('block_reason')} ← Should exist (not 'blocker_reason')")
            print(f"  - notes: {status.get('notes')}")
    
    print("\n" + "=" * 80)
    print("FULL JSON OUTPUT (for verification):")
    print("=" * 80)
    print(json.dumps(data, indent=2, default=str))
    
else:
    print("No roadmaps found in database. Create one first to test serializer output.")
