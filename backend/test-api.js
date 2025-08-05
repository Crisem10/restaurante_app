const { default: fetch } = require('node-fetch');

async function probarAPI() {
  try {
    console.log('🧪 Probando endpoints de la API...\n');
    
    // 1. Probar login
    console.log('1. Probando login...');
    const loginResponse = await fetch('http://localhost:3000/usuarios/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        correo: 'admin@test.com',
        contrasena: '123456'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Login falló, creando usuario de prueba...');
      
      // Crear usuario de prueba
      const registerResponse = await fetch('http://localhost:3000/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: 'Usuario Prueba',
          correo: 'admin@test.com',
          contrasena: '123456',
          telefono: '1234567890'
        })
      });
      
      if (registerResponse.ok) {
        console.log('✅ Usuario creado exitosamente');
        return probarAPI(); // Reintentar login
      } else {
        console.log('❌ Error creando usuario');
        return;
      }
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login exitoso');
    const token = loginData.token;
    
    // 1.5. Probar obtener perfil del usuario
    console.log('1.5. Probando obtener perfil del usuario...');
    const perfilResponse = await fetch('http://localhost:3000/usuarios/perfil', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (perfilResponse.ok) {
      const perfil = await perfilResponse.json();
      console.log(`✅ Perfil obtenido: ${perfil.nombre} (ID: ${perfil.id})`);
      
      // 1.6. Probar obtener reservas del usuario
      console.log('1.6. Probando obtener reservas del usuario...');
      const reservasResponse = await fetch(`http://localhost:3000/reservas/usuario/${perfil.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (reservasResponse.ok) {
        const reservas = await reservasResponse.json();
        console.log(`✅ Reservas encontradas: ${reservas.length}`);
        reservas.forEach((reserva, index) => {
          console.log(`  - Reserva ${index + 1}: Mesa ${reserva.Mesa.numero}, Fecha: ${reserva.fecha}, Hora: ${reserva.hora}`);
        });
      } else {
        console.log('❌ Error obteniendo reservas del usuario');
      }
    } else {
      console.log('❌ Error obteniendo perfil del usuario');
    }
    
    // 2. Probar obtener mesas disponibles
    console.log('2. Probando obtener mesas disponibles...');
    const mesasResponse = await fetch('http://localhost:3000/mesas/disponibles', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (mesasResponse.ok) {
      const mesas = await mesasResponse.json();
      console.log(`✅ Mesas disponibles: ${mesas.length}`);
    } else {
      console.log('❌ Error obteniendo mesas');
    }
    
    // 3. Probar crear reserva
    console.log('3. Probando crear reserva...');
    const reservaResponse = await fetch('http://localhost:3000/reservas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        fecha: '2025-08-05',
        hora: '19:00',
        personas: 2,
        preferencias_asiento: 'Junto a la ventana',
        mesa_id: 1
      })
    });
    
    if (reservaResponse.ok) {
      const reserva = await reservaResponse.json();
      console.log('✅ Reserva creada exitosamente');
      console.log('Reserva ID:', reserva.id);
    } else {
      const errorText = await reservaResponse.text();
      console.log('❌ Error creando reserva (status:', reservaResponse.status, ')');
      console.log('Respuesta:', errorText);
    }
    
    console.log('\n🎉 Pruebas completadas');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

probarAPI();
