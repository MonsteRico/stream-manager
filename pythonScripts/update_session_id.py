import os
import re
from pathlib import Path

def update_session_id_in_file(file_path, new_session_id):
    """Update the SESSION_ID value in a Python file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Pattern to match SESSION_ID = "..." or SESSION_ID = '...'
        pattern = r'SESSION_ID\s*=\s*["\']([^"\']+)["\']'
        
        # Replace the session ID value
        new_content = re.sub(pattern, f'SESSION_ID = "{new_session_id}"', content)
        
        # Only write if content changed
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    # Get the directory where this script is located
    script_dir = Path(__file__).parent
    
    # Ask user for session ID
    print("Session ID Updater")
    print("=" * 50)
    new_session_id = input("Enter the new session ID: ").strip()
    
    if not new_session_id:
        print("Error: Session ID cannot be empty.")
        return
    
    # Validate session ID format (basic check - UUID format)
    uuid_pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    if not re.match(uuid_pattern, new_session_id, re.IGNORECASE):
        response = input("Warning: Session ID doesn't match UUID format. Continue anyway? (y/n): ").strip().lower()
        if response != 'y':
            print("Operation cancelled.")
            return
    
    # Find all Python files recursively
    python_files = list(script_dir.rglob('*.py'))
    
    # Exclude this script itself
    python_files = [f for f in python_files if f.name != 'update_session_id.py']
    
    if not python_files:
        print("No Python files found to update.")
        return
    
    print(f"\nFound {len(python_files)} Python file(s) to process.")
    print("Updating session IDs...")
    print("-" * 50)
    
    updated_count = 0
    skipped_count = 0
    
    for file_path in python_files:
        relative_path = file_path.relative_to(script_dir)
        if update_session_id_in_file(file_path, new_session_id):
            print(f"✓ Updated: {relative_path}")
            updated_count += 1
        else:
            print(f"- Skipped: {relative_path} (no SESSION_ID found or already matches)")
            skipped_count += 1
    
    print("-" * 50)
    print(f"\nSummary:")
    print(f"  Updated: {updated_count} file(s)")
    print(f"  Skipped: {skipped_count} file(s)")
    print(f"\nSession ID update complete!")

if __name__ == "__main__":
    main()
