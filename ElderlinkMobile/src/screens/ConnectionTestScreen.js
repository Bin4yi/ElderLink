import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { testBackendConnection } from '../utils/testBackendConnection';
import { API_BASE_URL } from '../utils/constants';

/**
 * Connection Test Screen
 * Add this to your app to test backend connectivity
 * 
 * Usage: <ConnectionTestScreen />
 */
const ConnectionTestScreen = () => {
  const [testResult, setTestResult] = useState('');
  const [testing, setTesting] = useState(false);

  const runTest = async () => {
    setTesting(true);
    setTestResult('Running tests...\n\n');
    
    // Capture console logs
    const originalLog = console.log;
    const originalError = console.error;
    let logs = '';
    
    console.log = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      logs += message + '\n';
      originalLog(...args);
    };
    
    console.error = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      logs += '❌ ' + message + '\n';
      originalError(...args);
    };

    try {
      await testBackendConnection();
    } catch (error) {
      logs += '\n❌ Test failed: ' + error.message;
    }

    // Restore console
    console.log = originalLog;
    console.error = originalError;

    setTestResult(logs);
    setTesting(false);
  };

  const copyIP = async () => {
    // Get current IP from API_BASE_URL
    const ipMatch = API_BASE_URL.match(/http:\/\/([\d.]+):/);
    const currentIP = ipMatch ? ipMatch[1] : 'Not found';
    
    Alert.alert(
      'Current Configuration',
      `API Base URL: ${API_BASE_URL}\n\nIP Address: ${currentIP}\n\nIf SOS is not working:\n1. Check your computer's IP (run 'ipconfig')\n2. Update constants.js with new IP\n3. Restart Expo\n4. Test again`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 Backend Connection Test</Text>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>Current API:</Text>
        <Text style={styles.apiUrl}>{API_BASE_URL}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]}
          onPress={runTest}
          disabled={testing}
        >
          <Text style={styles.buttonText}>
            {testing ? '⏳ Testing...' : '🧪 Run Connection Test'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]}
          onPress={copyIP}
        >
          <Text style={styles.buttonText}>📋 Show IP Info</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultContainer}>
        <Text style={styles.resultText}>{testResult || 'Press "Run Test" to check backend connection'}</Text>
      </ScrollView>

      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>💡 Troubleshooting:</Text>
        <Text style={styles.instructionText}>
          1. Make sure backend is running: npm start{'\n'}
          2. Phone and computer on same WiFi{'\n'}
          3. Check firewall settings{'\n'}
          4. Update IP in constants.js if changed
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 5,
  },
  apiUrl: {
    fontSize: 12,
    color: '#555',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  secondaryButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    flex: 1,
    backgroundColor: '#263238',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  resultText: {
    color: '#4CAF50',
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  instructions: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 13,
    color: '#856404',
    lineHeight: 20,
  },
});

export default ConnectionTestScreen;
