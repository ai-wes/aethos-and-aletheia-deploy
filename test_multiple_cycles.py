#!/usr/bin/env python3
"""Test script to verify multiple learning cycles work correctly"""

import requests
import json
import time
import sys

API_BASE = "http://localhost:8080"

def test_multiple_cycles():
    # First, get an agent
    print("Getting agents...")
    response = requests.get(f"{API_BASE}/api/aletheia/agents")
    if response.status_code != 200:
        print(f"Failed to get agents: {response.status_code}")
        return
    
    agents = response.json()
    if not agents:
        print("No agents found. Please create an agent first.")
        return
    
    agent_id = agents[0]['_id']
    initial_version = agents[0]['version']
    print(f"Using agent {agent_id} with initial version {initial_version}")
    
    # Test SSE endpoint with cycles parameter
    cycles = 3
    print(f"\nTesting SSE endpoint with {cycles} cycles...")
    
    # Use requests to test the SSE endpoint
    url = f"{API_BASE}/api/aletheia/stream/learning/{agent_id}?cycles={cycles}"
    print(f"Connecting to: {url}")
    
    try:
        with requests.get(url, stream=True, headers={'Accept': 'text/event-stream'}) as response:
            if response.status_code != 200:
                print(f"Failed to connect: {response.status_code}")
                return
                
            print("Connected to SSE stream...")
            cycle_count = 0
            
            for line in response.iter_lines():
                if line:
                    line_str = line.decode('utf-8')
                    if line_str.startswith('data: '):
                        data_str = line_str[6:]  # Remove 'data: ' prefix
                        try:
                            data = json.loads(data_str)
                            event_type = data.get('type')
                            
                            if event_type == 'cycle_started':
                                cycle_num = data['payload']['cycle']
                                print(f"\n=== CYCLE {cycle_num} STARTED ===")
                            elif event_type == 'cycle_complete':
                                cycle_num = data['payload']['cycle']
                                cycle_count += 1
                                print(f"=== CYCLE {cycle_num} COMPLETE ===")
                            elif event_type == 'scenario_loaded':
                                print("- Scenario loaded")
                            elif event_type == 'decision_made':
                                print("- Decision made")
                            elif event_type == 'critique_generated':
                                print("- Critique generated")
                            elif event_type == 'reflection_complete':
                                print("- Reflection complete")
                            elif event_type == 'constitution_updated':
                                version = data['payload']['agent']['version']
                                print(f"- Constitution updated to version {version}")
                            elif event_type == 'error':
                                print(f"ERROR: {data['payload']['message']}")
                            elif event_type != 'heartbeat':
                                print(f"Event: {event_type}")
                                
                        except json.JSONDecodeError:
                            print(f"Failed to parse: {data_str}")
                            
            print(f"\n\nTotal cycles completed: {cycle_count}")
            
            # Check final agent version
            response = requests.get(f"{API_BASE}/api/aletheia/agents")
            if response.status_code == 200:
                agents = response.json()
                final_agent = next((a for a in agents if a['_id'] == agent_id), None)
                if final_agent:
                    final_version = final_agent['version']
                    print(f"Agent version changed from {initial_version} to {final_version}")
                    print(f"Expected {cycles} version increments, got {final_version - initial_version}")
                    
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_multiple_cycles()