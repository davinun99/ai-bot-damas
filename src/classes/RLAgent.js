
import { JUEGO_INCONCLUSO } from 'src/helpers/constants';
import Tablero from './Tablero';
export default class RLAgent{
    lookupTable = {};//Hash map
    tablero = new Tablero();//Tablero actual
    alpha = 0.0;
    estaEntrenando = true;//Parametro para actualizar o no la tabla
    resultadoDelJuego = 0;
    ultimoTablero = new Tablero();//Auxiliar con el ultimo tablero usado
    qRate = 0.1;
    N;
    constructor( N ){
        this.N = N;
        this.lookupTable = {};
    }
    getProbabilidad( tablero ){//Tablero = Tablero()
        const serialTablero = tablero.serializarTablero();
        if( typeof this.lookupTable[serialTablero] === 'undefined' ){
            this.lookupTable[serialTablero] = 0.5;//No se si se el valor inicial 
            return 0.5;
        }
        return this.lookupTable[serialTablero];
    }
    actualizarProbabilidad( tablero, probSgteEstado, jugador ){//Tablero = Tablero(), jugador= 1 | 2
        let prob = tablero.getRewardByJugador(jugador);
        prob = prob + this.alpha * (probSgteEstado - prob);//No se si podemos usar asi o cambiar 
        const serialTablero = tablero.serializarTablero();
        this.lookupTable[serialTablero] = prob;
    }
    jugar( jugador ){//jugador= 1 | 2
        //ELITISTA?
        let jugadaARealizar;
        let prob, maxProb = -1;
        const jugadas = this.tablero.getAllJugadas(jugador);
        for (const jugada of jugadas) {//recorrer las jugadas posibles
            const copiaTablero = this.tablero.clonarTablero();
            this.tablero.jugar(jugada);
            prob = this.tablero.getRewardByJugador(jugador);
            //calcular reward del tablero formado
            if(prob > maxProb){
                maxProb = prob;//Actualizar maximo reward
                jugadaARealizar = jugada;
            }
            this.tablero.table = copiaTablero;
        }
        if(this.estaEntrenando){
            this.actualizarProbabilidad(this.ultimoTablero, maxProb, jugador);
        }
        if(jugadaARealizar){
            this.tablero.jugar(jugadaARealizar);
            const copiaTablero = this.tablero.clonarTablero();
            this.ultimoTablero = new Tablero(copiaTablero);
        }
    }
    resetearTablero(){
        this.tablero = new Tablero();
        this.ultimoTablero = new Tablero();
    }
    jugarRandom(jugador, esAgente = false){
        this.tablero.jugarRandom(jugador);
        if(esAgente){
            const copiaTablero = this.tablero.clonarTablero();
            this.ultimoTablero = new Tablero(copiaTablero);
        }
    }
    jugarVsRandom(jugador = 1){
        //Jugadas promedio de una partida = 49
        //https://boardgames.stackexchange.com/questions/34659/how-many-turns-does-an-average-game-of-checkers-draughts-go-for
        const contrario = (jugador % 2) + 1;
        let turno = 1;
        let jugadas = 49;
        let q = 0;
        do{
            if(turno == jugador){
                q = Math.random();
                if( q < this.qRate || !this.estaEntrenando){
                    this.jugar(jugador);
                }else{
                    this.jugarRandom(jugador, true);
                }
            }else{
                this.jugarRandom(contrario, false);
            }
            this.resultadoDelJuego = this.tablero.calcularResultado();
            if(this.resultadoDelJuego !== JUEGO_INCONCLUSO){
                //this.tablero.dibujarTablero();
                if( !this.tablero.jugadorEsGanador(jugador) && this.estaEntrenando){//perdimos, actualizar tablero
                    this.actualizarProbabilidad( this.ultimoTablero, this.tablero.getRewardByJugador(jugador), jugador );
                }
                break;
            }
            turno = (turno % 2) + 1;
            jugadas--;
        } while( jugadas > 0 );
        this.resetearTablero();
    }
}