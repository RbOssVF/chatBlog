import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

//habilitar cors websocket
@WebSocketGateway()

export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    handleConnection(client: Socket) {
        console.log(`Cliente conectado: ${client.id}`);
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
    EnviarNotificaciones(jsonNotificaciones: any) {
        this.server.emit('nuevoUsuario', jsonNotificaciones);
    }
}