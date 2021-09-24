import RLAgent from './RLAgent';
import MinimaxPodaAlfaBeta from './MinimaxPodaAlfaBeta';
import Minimax from './Minimax';
import Tablero from './Tablero';

export default class Simulacion {
    constructor(simulaciones, j1 = { p1, n1 }, j2 = { p2, n2 }) {
        this.maxJugadas = 50;
        this.simulaciones = simulaciones;
        this.jugador1 = null;
        this.jugador2 = null;
        this.tablero = null;
        this.j1 = j1;
        this.j2 = j2;
    }
    nuevaSimulacionInfo(n) {
        return {
            n,
            resultado: '',
            mensaje: '',
            jugador1: {
                tiempo: 0,
                expansion: 0
            },
            jugador2: {
                tiempo: 0,
                expansion: 0
            }
        }
    }
    inicializarJugador(jugador, tipoJugador, nJuador) {
        return tipoJugador === 'rl' ? new RLAgent(jugador, nJuador, this.tablero) :
            tipoJugador === 'poda' ? new MinimaxPodaAlfaBeta(jugador, nJuador, this.tablero) :
                new Minimax(jugador, nJuador, this.tablero);
    }
    iniciarSimulacion() {
        let partidaActual = this.nuevaSimulacionInfo(1);
        const partidas = [];
        for (let i = 0; i < this.simulaciones; i++) {
            // Inicializar partida
            this.tablero = new Tablero();
            this.jugador1 = this.inicializarJugador(1, this.j1.p1, this.j1.n1);
            this.jugador2 = this.inicializarJugador(2, this.j2.p2, this.j2.n2);
            
            // Iniciar partida y obtener resultado
            partidaActual.resultado = this.jugarTurnos(partidaActual);
            partidaActual.mensaje = partidaActual.resultado === 1 ? 'Ganaron las negras' :
                partidaActual.resultado === 2 ? 'Ganaron las blancas' :
                    partidaActual.resultado === 3 ? 'Empate' : 'Inconcluso';

            // Guardar y reiniciar partida
            partidas.push(partidaActual);
            partidaActual = this.nuevaSimulacionInfo(i + 2);
        }
        return partidas;
    }
    jugarTurnos(partidaActual, jugadas = 0) {
        const resultado = this.tablero.calcularResultadoInt();
        if (resultado !== 0) {
            return resultado;
            /*return resultado === 1 ? 'Ganaron las negras' :
                resultado === 2 ? 'Ganaron las blancas' :
                    resultado === 3 ? 'Empate' : 'Inconcluso';*/
        }
        if (jugadas >= 50) 0;//return 'Inconcluso (50 jugadas alcanzadas)';

        const p1 = performance.now();
        this.jugador1.jugar();
        const p2 = performance.now();
        this.jugador2.jugar();
        const p3 = performance.now();

        partidaActual.jugador1.tiempo += p2 - p1;
        partidaActual.jugador2.tiempo += p3 - p2;

        partidaActual.jugador1.expansion = this.jugador1.nodosExpandidos;
        partidaActual.jugador2.expansion = this.jugador2.nodosExpandidos;

        return this.jugarTurnos(partidaActual, jugadas += 2);
    }
}