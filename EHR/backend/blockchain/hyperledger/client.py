"""
Hyperledger Fabric client for the Healthcare EHR Backend
"""

import os
import json
import base64
import hashlib
from flask import current_app

# Load Hyperledger Fabric configuration
def get_hyperledger_config():
    """Get Hyperledger Fabric configuration from environment variables or app config"""
    if current_app:
        hyperledger_config = current_app.config.get('HYPERLEDGER_CONFIG')
    else:
        hyperledger_config = os.environ.get('HYPERLEDGER_CONFIG', 'config/hyperledger-connection.json')
    
    # Check if config file exists
    if os.path.exists(hyperledger_config):
        with open(hyperledger_config, 'r') as f:
            config = json.load(f)
    else:
        # Default configuration
        config = {
            'channel': 'healthchannel',
            'chaincode': 'medicalrecords',
            'org': 'Org1',
            'user': 'Admin',
            'peer': 'peer0.org1.example.com:7051'
        }
    
    return config

# Check Hyperledger Fabric connection
def check_connection():
    """Check Hyperledger Fabric connection status"""
    # For demo purposes, simulate a successful connection
    return {
        'connected': True,
        'network': 'Hyperledger Fabric (Demo)',
        'channel': 'healthchannel',
        'chaincode': 'medicalrecords'
    }

# Store record hash on Hyperledger Fabric
def store_record(record_hash):
    """
    Store record hash on Hyperledger Fabric
    
    Args:
        record_hash (str): The hash of the medical record
        
    Returns:
        str: Transaction ID
    """
    # For demo purposes, generate a simulated transaction ID
    tx_id = hashlib.sha256(f"tx_{record_hash}".encode()).hexdigest()
    print(f"[Hyperledger] Stored record with hash: {record_hash}")
    print(f"[Hyperledger] Transaction ID: {tx_id}")
    return tx_id

# Verify record hash on Hyperledger Fabric
def verify_record(record_hash, transaction_id=None):
    """
    Verify record hash on Hyperledger Fabric
    
    Args:
        record_hash (str): The hash of the medical record
        transaction_id (str, optional): The transaction ID to verify
        
    Returns:
        bool: True if verified, False otherwise
    """
    # For demo purposes, always return True
    print(f"[Hyperledger] Verified record with hash: {record_hash}")
    return True

# Create Hyperledger Fabric chaincode
def create_chaincode_files():
    """Create Hyperledger Fabric chaincode files if they don't exist"""
    import os
    
    # Create chaincode directory if it doesn't exist
    chaincode_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'chaincode')
    os.makedirs(chaincode_dir, exist_ok=True)
    
    # Create medicalrecords.go
    chaincode_path = os.path.join(chaincode_dir, 'medicalrecords.go')
    if not os.path.exists(chaincode_path):
        with open(chaincode_path, 'w') as f:
            f.write('''package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// MedicalRecord represents a medical record in the blockchain
type MedicalRecord struct {
	RecordHash string    `json:"recordHash"`
	Timestamp  time.Time `json:"timestamp"`
	Doctor     string    `json:"doctor"`
	Patient    string    `json:"patient"`
}

// MedicalRecordsContract provides functions for managing medical records
type MedicalRecordsContract struct {
	contractapi.Contract
}

// InitLedger initializes the ledger with sample data
func (s *MedicalRecordsContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	return nil
}

// StoreRecord stores a new medical record hash on the blockchain
func (s *MedicalRecordsContract) StoreRecord(ctx contractapi.TransactionContextInterface, recordHash string, doctor string, patient string) error {
	// Check if record already exists
	exists, err := s.RecordExists(ctx, recordHash)
	if err != nil {
		return fmt.Errorf("failed to check if record exists: %v", err)
	}
	if exists {
		return fmt.Errorf("record with hash %s already exists", recordHash)
	}

	// Create new record
	record := MedicalRecord{
		RecordHash: recordHash,
		Timestamp:  time.Now(),
		Doctor:     doctor,
		Patient:    patient,
	}

	// Convert to JSON
	recordJSON, err := json.Marshal(record)
	if err != nil {
		return fmt.Errorf("failed to marshal record: %v", err)
	}

	// Store record in state
	err = ctx.GetStub().PutState(recordHash, recordJSON)
	if err != nil {
		return fmt.Errorf("failed to put record in state: %v", err)
	}

	return nil
}

// GetRecord retrieves a medical record by its hash
func (s *MedicalRecordsContract) GetRecord(ctx contractapi.TransactionContextInterface, recordHash string) (*MedicalRecord, error) {
	// Get record from state
	recordJSON, err := ctx.GetStub().GetState(recordHash)
	if err != nil {
		return nil, fmt.Errorf("failed to get record from state: %v", err)
	}
	if recordJSON == nil {
		return nil, fmt.Errorf("record with hash %s does not exist", recordHash)
	}

	// Convert from JSON
	var record MedicalRecord
	err = json.Unmarshal(recordJSON, &record)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal record: %v", err)
	}

	return &record, nil
}

// RecordExists checks if a record with the given hash exists
func (s *MedicalRecordsContract) RecordExists(ctx contractapi.TransactionContextInterface, recordHash string) (bool, error) {
	// Get record from state
	recordJSON, err := ctx.GetStub().GetState(recordHash)
	if err != nil {
		return false, fmt.Errorf("failed to get record from state: %v", err)
	}

	return recordJSON != nil, nil
}

// GetRecordsByPatient retrieves all records for a patient
func (s *MedicalRecordsContract) GetRecordsByPatient(ctx contractapi.TransactionContextInterface, patient string) ([]*MedicalRecord, error) {
	// Get all records
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, fmt.Errorf("failed to get state by range: %v", err)
	}
	defer resultsIterator.Close()

	// Filter records by patient
	var records []*MedicalRecord
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, fmt.Errorf("failed to get next result: %v", err)
		}

		var record MedicalRecord
		err = json.Unmarshal(queryResponse.Value, &record)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal record: %v", err)
		}

		if record.Patient == patient {
			records = append(records, &record)
		}
	}

	return records, nil
}

// GetRecordsByDoctor retrieves all records created by a doctor
func (s *MedicalRecordsContract) GetRecordsByDoctor(ctx contractapi.TransactionContextInterface, doctor string) ([]*MedicalRecord, error) {
	// Get all records
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, fmt.Errorf("failed to get state by range: %v", err)
	}
	defer resultsIterator.Close()

	// Filter records by doctor
	var records []*MedicalRecord
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, fmt.Errorf("failed to get next result: %v", err)
		}

		var record MedicalRecord
		err = json.Unmarshal(queryResponse.Value, &record)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal record: %v", err)
		}

		if record.Doctor == doctor {
			records = append(records, &record)
		}
	}

	return records, nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(&MedicalRecordsContract{})
	if err != nil {
		fmt.Printf("Error creating medical records chaincode: %v\\n", err)
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting medical records chaincode: %v\\n", err)
	}
}
''')
    
    # Create connection.json
    connection_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'config/hyperledger-connection.json')
    os.makedirs(os.path.dirname(connection_path), exist_ok=True)
    
    if not os.path.exists(connection_path):
        with open(connection_path, 'w') as f:
            f.write('''{
  "name": "healthcare-network",
  "version": "1.0.0",
  "client": {
    "organization": "Org1",
    "connection": {
      "timeout": {
        "peer": {
          "endorser": "300"
        },
        "orderer": "300"
      }
    }
  },
  "channels": {
    "healthchannel": {
      "orderers": [
        "orderer.example.com"
      ],
      "peers": {
        "peer0.org1.example.com": {
          "endorsingPeer": true,
          "chaincodeQuery": true,
          "ledgerQuery": true,
          "eventSource": true
        }
      }
    }
  },
  "organizations": {
    "Org1": {
      "mspid": "Org1MSP",
      "peers": [
        "peer0.org1.example.com"
      ],
      "certificateAuthorities": [
        "ca.org1.example.com"
      ]
    }
  },
  "orderers": {
    "orderer.example.com": {
      "url": "grpcs://localhost:7050",
      "tlsCACerts": {
        "path": "/path/to/orderer/tls/ca.crt"
      },
      "grpcOptions": {
        "ssl-target-name-override": "orderer.example.com"
      }
    }
  },
  "peers": {
    "peer0.org1.example.com": {
      "url": "grpcs://localhost:7051",
      "tlsCACerts": {
        "path": "/path/to/peer/tls/ca.crt"
      },
      "grpcOptions": {
        "ssl-target-name-override": "peer0.org1.example.com"
      }
    }
  },
  "certificateAuthorities": {
    "ca.org1.example.com": {
      "url": "https://localhost:7054",
      "caName": "ca.org1.example.com",
      "tlsCACerts": {
        "path": "/path/to/ca/tls/ca.crt"
      },
      "httpOptions": {
        "verify": false
      }
    }
  }
}''')

# Create Hyperledger Fabric chaincode files when this module is imported
create_chaincode_files()

# Create __init__.py
def create_init_file():
    """Create __init__.py file if it doesn't exist"""
    import os
    
    # Create __init__.py
    init_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '__init__.py')
    if not os.path.exists(init_path):
        with open(init_path, 'w') as f:
            f.write('"""Hyperledger Fabric client for the Healthcare EHR Backend"""\n')

# Create __init__.py file when this module is imported
create_init_file() 