
import MinimaxPodaAlfaBeta from './MinimaxPodaAlfaBeta';
import Tablero from './Tablero';
export default class RLAgent{
    lookupTable = {};//Hash map
    tablero = null;//Tablero actual
    alpha = 0.0;
    estaEntrenando = true;//Parametro para actualizar o no la tabla
    resultadoDelJuego = 0;
    ultimoTablero = null;//Auxiliar con el ultimo tablero usado
    qRate = 0.2;
    N;
    constructor(jugador, N, tablero){
        this.N = N;
        this.jugador = jugador;
        this.lookupTable = {};
        this.tablero = tablero;
        this.ultimoTablero = tablero;
        this.nodosExpandidos = 0;
    }
    resetearTablero() {
        this.nodosExpandidos = 0;
        this.ultimoTablero.resetearTablero();
        this.tablero.resetearTablero();
        this.resultadoDelJuego = 0;
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
    jugar(){//jugador= 1 | 2
        let jugadaARealizar;
        let prob, maxProb = -1;
        const jugadas = this.tablero.getAllJugadas(this.jugador);
        if( !jugadas.length ){
            this.resultadoDelJuego = 3;
            return false;
        }
        if(this.estaEntrenando && Math.random() > this.qRate){
            return this.jugarRandom(this.jugador, true);
        }
        for (const jugada of jugadas) {//recorrer las jugadas posibles
            this.nodosExpandidos++;
            const copiaTablero = this.tablero.clonarTablero();
            this.tablero.jugar(jugada);
            prob = this.calcularReward(this.tablero, this.jugador);
            //calcular reward del tablero formado
            if(prob > maxProb){
                maxProb = prob;//Actualizar maximo reward
                jugadaARealizar = jugada;
            }
            this.tablero.table = copiaTablero;
        }
        if(this.estaEntrenando){
            this.actualizarProbabilidad(this.ultimoTablero, maxProb, this.jugador);
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
    entrenar(minimaxAgent){
        //ENTRENA n/2 veces con random y n/2 veces con Minimax
        this.entrenarVsRandom( this.N / 2 );
        this.alpha = 0.6;
        this.qRate = 0.3;
        this.entrenarVsMinimax( this.jugador, this.N / 2, minimaxAgent );
        this.qRate = 0.2;
    }
    entrenarVsRandom(n){
        for (let i = 0; i < n; i++) {
            this.resetearTablero();
            this.actualizarAlpha(i);
            this.jugarVsRandom(this.jugador);
            console.log('Entrenando vs Random...');
        }
        this.resetearTablero();
    }
    entrenarVsMinimax( jugador, n , minimaxAgent ){
        const contrario = jugador % 2 + 1;
        console.log('entrenarVsMinimax')
        if(!minimaxAgent){
            minimaxAgent = new MinimaxPodaAlfaBeta(contrario, 2, this.tablero)
        }
        for (let i = 0; i < n; i++) {
            this.resetearTablero();
            this.jugarVsMinimax(jugador, minimaxAgent);
            console.log('Entrenando vs Minimax...');
        }
        this.resetearTablero();
    }
    jugarVsMinimax(jugador = 1, minimaxAgent){
        let turno = 1;
        let jugadas = 60;
        do{
            let haJugado = false;
            if(turno === jugador){
                haJugado = this.jugar(jugador);
            }else{
                haJugado = true;
                minimaxAgent.jugar();
            }
            if(!haJugado){
                this.resultadoDelJuego = 3;
            }else{
                this.resultadoDelJuego = this.tablero.calcularResultadoInt();
            }
            if(this.resultadoDelJuego !== 0){
                if( !this.tablero.jugadorEsGanador(jugador) && this.estaEntrenando){//perdimos, actualizar tablero
                    this.actualizarProbabilidad( this.ultimoTablero, this.calcularReward(this.tablero, jugador), jugador );
                }
                break;
            }
            turno = (turno % 2) + 1;
            jugadas--;
        }while( jugadas > 0)
    }
    jugarVsRandom(jugador = 1){
        
        const contrario = (jugador % 2) + 1;
        let turno = 1;
        let jugadas = 60;
        do{
            let haJugado = false;
            if(turno === jugador){
                haJugado = this.jugar(jugador); 
            }else{
                haJugado = this.jugarRandom(contrario, false);
            }
            if(!haJugado){
                this.resultadoDelJuego = 3;
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