import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

//habilitar cors websocket
@WebSocketGateway({
    cors: {
        origin: '*', // Permitir CORS si es necesario
    },
})

export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    handleConnection(client: Socket) {
        const userId = client.handshake.query.userId; // Obtener el userId del cliente
    
        if (userId) {
            client.join(`user_${userId}`); // Unir al cliente a la sala basada en su ID
            console.log(`Usuario ${userId} conectado en la sala user_${userId}`);
        } else {
            console.log(`Error: No se proporcionó un userId en la query.`);
        }
    }

    handleDisconnect(client: Socket) {
        console.log(`Cliente desconectado: ${client.id}`);
    }

    @SubscribeMessage('message')
    handleMessage(client: Socket, payload: string): void {
        console.log('Mensaje recibido: ', payload);
    }

    handleError(client: Socket, error: Error) {
        console.error(`Error en la conexión: ${error.message}`);
    }
    EnviarNotificacionUsuario(userId: number, mensaje: any) {
        console.log(`Enviando mensaje a user_${userId}:`, mensaje);
        this.server.to(`user_${userId}`).emit('mensajePrivado', mensaje); // Enviar a la sala específica
    }
    EnviarVistoUsuario(userId: number, mensajeVisto: any) {
        console.log(`Enviando visto a user_${userId}`);
        this.server.to(`user_${userId}`).emit('mensajeVisto', mensajeVisto); // Enviar a la sala específica
    }
}