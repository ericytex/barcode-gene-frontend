#!/usr/bin/env python3
"""
Environment Setup Script for Barcode Generator
This script helps set up the virtual environment and install dependencies
"""

import subprocess
import sys
import os
import platform

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n{'='*50}")
    print(f"🔄 {description}")
    print(f"{'='*50}")
    print(f"Running: {command}")
    
    try:
        if platform.system() == "Windows":
            result = subprocess.run(command, shell=True, check=True, text=True, capture_output=True)
        else:
            result = subprocess.run(command.split(), check=True, text=True, capture_output=True)
        
        if result.stdout:
            print(result.stdout)
        print(f"✅ {description} - SUCCESS")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} - FAILED")
        print(f"Error: {e}")
        if e.stdout:
            print(f"Output: {e.stdout}")
        if e.stderr:
            print(f"Error output: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major >= 3 and version.minor >= 8:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} - Compatible")
        return True
    else:
        print(f"❌ Python {version.major}.{version.minor}.{version.micro} - Need Python 3.8+")
        return False

def setup_virtual_environment():
    """Set up the virtual environment"""
    print("🚀 Starting Barcode Generator Environment Setup")
    print("=" * 60)
    
    # Check Python version
    if not check_python_version():
        print("Please upgrade Python to version 3.8 or higher")
        return False
    
    # Create virtual environment
    venv_name = "barcode_env"
    
    if not run_command(f"{sys.executable} -m venv {venv_name}", 
                      f"Creating virtual environment '{venv_name}'"):
        return False
    
    # Determine activation command based on OS
    if platform.system() == "Windows":
        activate_cmd = f"{venv_name}\\Scripts\\activate"
        pip_cmd = f"{venv_name}\\Scripts\\pip"
        python_cmd = f"{venv_name}\\Scripts\\python"
    else:
        activate_cmd = f"source {venv_name}/bin/activate"
        pip_cmd = f"{venv_name}/bin/pip"
        python_cmd = f"{venv_name}/bin/python"
    
    # Upgrade pip in virtual environment
    if not run_command(f"{python_cmd} -m pip install --upgrade pip", 
                      "Upgrading pip in virtual environment"):
        return False
    
    # Install requirements
    if os.path.exists("requirements.txt"):
        if not run_command(f"{pip_cmd} install -r requirements.txt", 
                          "Installing requirements from requirements.txt"):
            return False
    else:
        # Install packages individually if requirements.txt doesn't exist
        packages = [
            "pandas>=1.5.0",
            "Pillow>=9.0.0",
            "qrcode[pil]>=7.4.2",
            "python-barcode>=0.14.0"
        ]
        
        for package in packages:
            if not run_command(f"{pip_cmd} install {package}", 
                              f"Installing {package}"):
                return False
    
    # Show success message
    print(f"\n{'='*60}")
    print("🎉 SETUP COMPLETE!")
    print(f"{'='*60}")
    print(f"Virtual environment '{venv_name}' is ready!")
    print("\nTo activate the environment:")
    
    if platform.system() == "Windows":
        print(f"   {venv_name}\\Scripts\\activate")
        print("   Or simply: activate_env.bat")
    else:
        print(f"   source {venv_name}/bin/activate")
        print("   Or simply: source activate_env.sh")
    
    print("\nTo deactivate when done:")
    print("   deactivate")
    
    print(f"\nTo run the barcode generator:")
    print(f"   {python_cmd} barcode_generator.py")
    
    # Create activation scripts
    create_activation_scripts(venv_name)
    
    return True

def create_activation_scripts(venv_name):
    """Create convenient activation scripts"""
    
    if platform.system() == "Windows":
        # Windows batch file
        batch_content = f"""@echo off
echo Activating barcode generator environment...
call {venv_name}\\Scripts\\activate.bat
echo Environment activated! You can now run: python barcode_generator.py
cmd /k
"""
        with open("activate_env.bat", "w") as f:
            f.write(batch_content)
        print("✅ Created activate_env.bat for easy activation")
    
    else:
        # Unix shell script
        shell_content = f"""#!/bin/bash
echo "Activating barcode generator environment..."
source {venv_name}/bin/activate
echo "Environment activated! You can now run: python barcode_generator.py"
exec "$SHELL"
"""
        with open("activate_env.sh", "w") as f:
            f.write(shell_content)
        os.chmod("activate_env.sh", 0o755)
        print("✅ Created activate_env.sh for easy activation")

def main():
    """Main setup function"""
    try:
        success = setup_virtual_environment()
        if success:
            print(f"\n{'='*60}")
            print("📋 NEXT STEPS:")
            print(f"{'='*60}")
            print("1. Activate the virtual environment")
            print("2. Run the barcode generator script")
            print("3. Check the generated_barcodes folder for output")
            print("\nHappy barcode generating! 📊")
        else:
            print("\n❌ Setup failed. Please check the errors above.")
            sys.exit(1)
    
    except KeyboardInterrupt:
        print("\n\n⚠️  Setup interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error during setup: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()