// Simple test login function
import { API_CONFIG } from '../utils/constants';

export async function testLogin(email, password) {
  console.log('🧪 TEST LOGIN FUNCTION CALLED!');
  console.log('📧 Email:', email);
  console.log('🔑 Password:', password ? '***' : 'null');
  
  const url = `${API_CONFIG.BASE_URL}/api/auth/login`;
  console.log('🌐 URL:', url);
  
  const body = JSON.stringify({ email, password });
  console.log('📦 Body:', body);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: body,
    });
    
    console.log('📡 Response status:', response.status);
    const data = await response.json();
    console.log('📡 Response data:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Test login error:', error);
    throw error;
  }
}
