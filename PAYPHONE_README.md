# Integración con Payphone

Esta guía te explica cómo configurar y usar la integración con Payphone en tu aplicación de restaurante.

## Configuración Inicial

### 1. Variables de Entorno (Backend)

Crea un archivo `.env` en el directorio `backend-restaurante` con las siguientes variables:

```env
# Configuración de Payphone
PAYPHONE_API_URL=https://pay.payphoneapp.com/api/v1
PAYPHONE_API_KEY=tu_api_key_de_payphone_aqui
PAYPHONE_STORE_ID=tu_store_id_aqui
```

### 2. Actualización de Base de Datos

Los nuevos campos en el modelo `Pago` son:
- `transaction_id`: ID de transacción de Payphone
- `fecha_confirmacion`: Fecha de confirmación del pago

Si ya tienes datos en tu base de datos, ejecuta estas consultas SQL:

```sql
ALTER TABLE restaurante.pagos 
ADD COLUMN transaction_id VARCHAR(100),
ADD COLUMN fecha_confirmacion TIMESTAMP;
```

### 3. Instalación de Dependencias

Asegúrate de que tu backend tenga instalado `axios`:

```bash
cd backend-restaurante
npm install axios
```

## Uso de la Integración

### En el Frontend (Angular/Ionic)

#### 1. Importar el Servicio

```typescript
import { PayphoneService } from '../services/payphone.service';

constructor(private payphoneService: PayphoneService) {}
```

#### 2. Crear un Pago

```typescript
const pagoData = {
  reserva_id: 123,
  monto: 25.50,
  telefono: '0987654321',
  descripcion: 'Pago reserva mesa 5'
};

this.payphoneService.crearPago(pagoData).subscribe(
  response => {
    if (response.success) {
      console.log('Pago iniciado:', response);
      // Guardar transaction_id para verificación
      this.transactionId = response.payphone.transactionId;
    }
  },
  error => {
    console.error('Error:', error);
  }
);
```

#### 3. Verificar Estado del Pago

```typescript
this.payphoneService.verificarEstadoPago(transactionId).subscribe(
  response => {
    console.log('Estado:', response.estado);
    if (this.payphoneService.esPagoExitoso(response.estado)) {
      // Pago exitoso
    }
  }
);
```

### Endpoints del Backend

#### POST `/pagos/payphone/crear`
Crea un nuevo pago con Payphone.

**Body:**
```json
{
  "reserva_id": 123,
  "monto": 25.50,
  "telefono": "0987654321",
  "descripcion": "Descripción opcional"
}
```

#### GET `/pagos/payphone/verificar/:transactionId`
Verifica el estado de un pago.

#### POST `/pagos/payphone/confirmar/:transactionId`
Confirma o cancela un pago manualmente.

**Body:**
```json
{
  "confirmacion": true
}
```

## Estados de Pago

Los posibles estados de pago son:

- `pendiente`: Pago iniciado, esperando confirmación
- `procesando`: Pago en proceso
- `approved`: Pago aprobado
- `completed`: Pago completado exitosamente
- `failed`: Pago falló
- `cancelled`: Pago cancelado
- `expired`: Pago expiró
- `confirmado`: Pago confirmado manualmente

## Validación de Teléfonos

El servicio incluye validación para números de teléfono ecuatorianos:

```typescript
// Válidos
this.payphoneService.validarTelefono('0987654321'); // true
this.payphoneService.validarTelefono('+593987654321'); // true
this.payphoneService.validarTelefono('987654321'); // true

// Formatear automáticamente
const telefonoFormateado = this.payphoneService.formatearTelefono('0987654321');
// Resultado: +593987654321
```

## Componente de Ejemplo

Hemos incluido un componente completo (`PagoPayphoneComponent`) que muestra:

- Formulario de pago con validación
- Procesamiento de pagos
- Verificación de estado
- Confirmación manual
- Manejo de errores
- Interfaz de usuario responsive

Para usar el componente:

1. Agrega el componente a tu módulo
2. Importa FormsModule para ngModel
3. Asegúrate de tener los servicios inyectados

## Seguridad

### Recomendaciones:

1. **API Keys**: Nunca expongas tus API keys en el frontend
2. **Validación**: Siempre valida los datos en el backend
3. **Logs**: Registra todas las transacciones para auditoría
4. **Webhooks**: Considera implementar webhooks para confirmaciones automáticas
5. **HTTPS**: Usa siempre HTTPS en producción

## Pruebas

Para probar la integración:

1. Configura las variables de entorno con tus credenciales de prueba de Payphone
2. Inicia el backend: `npm start`
3. Inicia el frontend: `ionic serve`
4. Usa el componente de pago con datos de prueba

## Solución de Problemas

### Error: "API Key inválida"
- Verifica que `PAYPHONE_API_KEY` esté correctamente configurada
- Asegúrate de estar usando la URL correcta (sandbox vs producción)

### Error: "Teléfono inválido"
- Usa el formato ecuatoriano: +593XXXXXXXXX
- El servicio formatea automáticamente números locales

### Error: "Reserva no encontrada"
- Verifica que el `reserva_id` exista en la base de datos
- Asegúrate de que el usuario tenga permisos para esa reserva

### Pago queda en "pendiente"
- Verifica la conexión con la API de Payphone
- Revisa los logs del servidor para errores
- Usa la función de verificación manual

## Soporte

Para problemas específicos de Payphone, consulta:
- [Documentación oficial de Payphone](https://payphone.app/docs)
- [Centro de ayuda de Payphone](https://help.payphone.app)

Para problemas con la integración, revisa los logs del backend y frontend.
