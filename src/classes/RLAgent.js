
import { EMPATE, JUEGO_INCONCLUSO, JUEGO_NO_INICIADO } from 'src/helpers/constants';
import MinimaxPodaAlfaBeta from './MinimaxPodaAlfaBeta';
import Tablero from './Tablero';
export default class RLAgent{
    lookupTable = {};//Hash map
    tablero = null;//Tablero actual
    alpha = 0.0;
    estaEntrenando = true;//Parametro para actualizar o no la tabla
    resultadoDelJuego = JUEGO_NO_INICIADO;
    ultimoTablero = null;//Auxiliar con el ultimo tablero usado
    qRate = 0.2;
    N;
    constructor( N, tablero ){
        this.N = N;
        this.lookupTable = {};
        this.tablero = tablero;
        this.ultimoTablero = tablero;
    }
    resetearTablero(){
        this.ultimoTablero.resetearTablero();
        this.tablero.resetearTablero();
        this.resultadoDelJuego = JUEGO_NO_INICIADO;
    }
    calcularReward( tablero, jugador){
        const contrario = (jugador % 2) + 1;
        const rewardTablero = tablero.getRewardByJugador(jugador);
        const result = this.tablero.calcularResultadoInt();
        if( result === jugador ){
            return 1;
        }else if( result === contrario || result === 3 ){
            return 0;
        }else{
            return rewardTablero ? rewardTablero : this.getProbabilidad(tablero);
        }
    }
    getProbabilidad( tablero ){//Tablero = Tablero()
        const serialTablero = tablero.serializarTablero();
        if( typeof this.lookupTable[serialTablero] === 'undefined' ){
            this.lookupTable[serialTablero] = 0.5;//No se si se el valor inicial 
            return 0.5;
        }
        return this.lookupTable[serialTablero];
    }
    actualizarAlpha( currentGame ){
        this.alpha = 0.5 - 0.49 * currentGame / this.N;
    }
    actualizarProbabilidad( tablero, probSgteEstado, jugador ){//Tablero = Tablero(), jugador= 1 | 2
        let prob = this.calcularReward(tablero, jugador);
        prob = prob + this.alpha * (probSgteEstado - prob);//No se si podemos usar asi o cambiar 
        const serialTablero = tablero.serializarTablero();
        this.lookupTable[serialTablero] = prob;
    }
    jugar( jugador ){//jugador= 1 | 2
        //ELITISTA?
        let jugadaARealizar;
        let prob, maxProb = -1;
        const jugadas = this.tablero.getAllJugadas(jugador);
        if( !jugadas.length ){
            this.resultadoDelJuego = EMPATE;
            return false;
        }
        for (const jugada of jugadas) {//recorrer las jugadas posibles
            const copiaTablero = this.tablero.clonarTablero();
            this.tablero.jugar(jugada);
            prob = this.calcularReward(this.tablero, jugador);
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
        this.tablero.jugar(jugadaARealizar);
        const copiaTablero = this.tablero.clonarTablero();
        this.ultimoTablero = new Tablero(copiaTablero);
        return true;
    }
    resetearTablero(){
        this.tablero.resetearTablero();
        this.ultimoTablero.resetearTablero();
    }
    jugarRandom(jugador, esAgente = false){
        const haJugado = this.tablero.jugarRandom(jugador);
        if(!haJugado){
            return false;
        }
        if(esAgente){
            const copiaTablero = this.tablero.clonarTablero();
            this.ultimoTablero = new Tablero(copiaTablero);
        }
        return true;
    }
    entrenarVsRandom(){
        for (let i = 0; i < this.N; i++) {
            this.resetearTablero();
            this.actualizarAlpha(i);
            this.jugarVsRandom();
            console.log('Entrenando...');
        }
        this.resetearTablero();
        //this.actualizarAlpha(0.6);
        console.log(JSON.parse(JSON.stringify(this.lookupTable)));
    }
    expectarPartidaVsRandom(jugador, esAgente){
        let haJugado = false;
        const q = Math.random();
        if(esAgente){
            if( q <= this.qRate || !this.estaEntrenando){
                haJugado = this.jugar(jugador); console.log('Agente ha jugado inteligente');
            }else{
                haJugado = this.jugarRandom(jugador, true); console.log('Agente ha jugado random');
            }
        }else{
            haJugado = this.jugarRandom(jugador, false);
        }
        if(!haJugado){
            this.resultadoDelJuego = EMPATE;
        }else{
            this.resultadoDelJuego = this.tablero.calcularResultadoInt();
        }
        if(this.resultadoDelJuego !== 0){
            console.log('Ha Terminado!! ' + this.resultadoDelJuego);
            //this.tablero.dibujarTablero();
            if( !this.tablero.jugadorEsGanador(jugador) && this.estaEntrenando){//perdimos, actualizar tablero
                this.actualizarProbabilidad( this.ultimoTablero, this.calcularReward(this.tablero, jugador), jugador );
            }
        }
    }
    entrenarVsMinimax( jugador, minimaxAgent = new MinimaxPodaAlfaBeta(2, this.tablero) ){
        for (let i = 0; i < this.N; i++) {
            this.resetearTablero();
            this.actualizarAlpha(i);
            this.jugarVsMinimax(jugador, minimaxAgent);
            console.log('Entrenando...');
        }
        this.resetearTablero();
    }
    jugarVsMinimax(jugador = 1, minimaxAgent){
        let turno = 1;
        let jugadas = 49;
        let q = 0;
        do{
            let haJugado = false;
            if(turno === jugador){
                q = Math.random();
                if(  q <= this.qRate || !this.estaEntrenando){
                    haJugado = this.jugar(jugador);
                }else{
                    haJugado = this.jugarRandom(jugador, true);
                }
            }else{
                haJugado = minimaxAgent.jugar();
            }
            turno = (turno % 2) + 1;
            jugadas--;
        }while( jugadas > 0)
    }
    jugarVsRandom(jugador = 1){
        //Jugadas promedio de una partida = 49
        //https://boardgames.stackexchange.com/questions/34659/how-many-turns-does-an-average-game-of-checkers-draughts-go-for
        const contrario = (jugador % 2) + 1;
        let turno = 1;
        let jugadas = 49;
        let q = 0;
        do{
            let haJugado = false;
            if(turno === jugador){
                q = Math.random();
                if( q <= this.qRate || !this.estaEntrenando){
                    haJugado = this.jugar(jugador); 
                    //console.log('Agente ha jugado inteligente');
                }else{
                    haJugado = this.jugarRandom(jugador, true); 
                    //console.log('Agente ha jugado random');
                }
            }else{
                haJugado = this.jugarRandom(contrario, false);
            }
            if(!haJugado){
                this.resultadoDelJuego = EMPATE;
            }else{
                this.resultadoDelJuego = this.tablero.calcularResultadoInt();
            }
            if(this.resultadoDelJuego !== 0){
                //this.tablero.dibujarTablero();
                if( !this.tablero.jugadorEsGanador(jugador) && this.estaEntrenando){//perdimos, actualizar tablero
                    this.actualizarProbabilidad( this.ultimoTablero, this.calcularReward(this.tablero, jugador), jugador );
                }
                break;
            }
            turno = (turno % 2) + 1;
            jugadas--;
        } while( jugadas > 0 );
    }
}