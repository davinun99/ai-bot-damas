import Tablero from 'src/classes/Tablero.js';
import {GANAN_BLANCAS, GANAN_NEGRAS, JUEGO_INCONCLUSO} from '../helpers/constants';
class MinimaxPodaAlfaBeta {
    tableroActual = null;
    alfa = -100000; 
    beta = 100000;
    profundidadMax = 1; //cantidad de niveles del árbol que como máximo bajará
    jugador = 1; //asumo que jugador es blancas (2)
    rival = 2; //asumo que es negras (1) el rival
    movimientoElegido = {};

    constructor( jugador = 1, N, tablero ){
        this.jugador = jugador;
        this.rival = (this.jugador % 2) + 1;
        this.tableroActual = tablero;
        this.profundidadMax = N || 1;
    }
    jugar( ){
        console.log('Tablero',this.tableroActual);
        if (this.tableroActual.getAllJugadas(this.rival).length === 0) { //si el rival ya no tiene movimientos posibles pierde
            console.log("el rival ha perdido");
        } else if(this.tableroActual.getAllJugadas(this.jugador).length === 0){ //si el jugador ya no tiene movimientos posibles pierde
            console.log("minimax con poda ha perdido");
        }else{
            this.movimientoElegido = {}; //hacemos vacío el movimiento elegido
            this.maxValue(this.tableroActual,this.profundidadMax,this.alfa,this.beta);
            
            let {movimiento, puedeCapturar, fichasCapturadas, ficha} = this.movimientoElegido; //desarmamos el movimiento
            let [movFila, movColumna] = movimiento; //ver valores del movimiento
            console.log('mov elegido: ['+movFila+']['+movColumna+']');

            this.tableroActual.jugar(this.movimientoElegido); //jugamos con el movimiento elegido que fue cargado en maxValue
        }
    }
    jugarVsRandom(){
        let index = 0;
        while (this.tableroActual.calcularResultado() === JUEGO_INCONCLUSO && index <100) { //limitamos a 200 turnos máximo
            index++;
            if (this.tableroActual.getAllJugadas(this.rival).length === 0) { //si el rival ya no tiene movimientos posibles pierde
                console.log("el rival ha perdido");
                break;
            } else if(this.tableroActual.getAllJugadas(this.jugador).length === 0){ //si el jugador ya no tiene movimientos posibles pierde
                console.log("minimax con poda ha perdido");
                break;
            }else{
                this.tableroActual.dibujarTablero();

                console.log('cant mov rival '+this.tableroActual.getAllJugadas(this.rival));
                console.log('cant mov minim '+this.tableroActual.getAllJugadas(this.jugador));

                //movimiento del rival
                console.log(index+") cantidad de fichas: "+this.tableroActual.cantFichasBlancas+" blancas y "+this.tableroActual.cantFichasNegras+" negras"); //mostramos al rival sus jugadas disponibles
                console.log("se elegira una jugada random entre las disponibles ");
                this.tableroActual.jugarRandom(this.rival);
                console.log('movimiento de rival');
                this.tableroActual.dibujarTablero();
                //movimiento del minimax
                this.movimientoElegido = {}; //hacemos vacío el movimiento elegido
                console.log("print minimax: "+this.maxValue(this.tableroActual,this.profundidadMax,this.alfa,this.beta));
                //console.log("juego: "+this.tableroActual.calcularResultado());
                let {movimiento, puedeCapturar, fichasCapturadas, ficha} = this.movimientoElegido; //desarmamos el movimiento
                let [movFila, movColumna] = movimiento; //ver valores del movimiento
                console.log('mov elegido: ['+movFila+']['+movColumna+']');
                this.tableroActual.jugar(this.movimientoElegido); //jugamos con el movimiento elegido que fue cargado en maxValue
            }
        }
        this.tableroActual.dibujarTablero();
    }

    //funciones minimax
    maxValue(tableroActual,profundidadMax,alfa,beta){ //función max de minimax
        //tablero que simulará la jugada y la pasará al siguiente elemento
        let tableroSimulado = new Tablero(tableroActual.table);
        console.log(tableroSimulado.calcularResultado());
        if (profundidadMax <=0 || tableroSimulado.calcularResultado() !== JUEGO_INCONCLUSO){
            //cutOff Test: Si ya se llegó al valor de corte o si la partida ya termina
            return this.rewardJugada(tableroActual);
        }
        
        let movElegido = [];
        for (let movimiento of tableroActual.getAllJugadas(this.jugador)) { 
            //Jugamos cada movimiento y lo pasamos como parámetro al siguiente nivel del arbol
            tableroSimulado.jugar(movimiento);
            let posibleMov = this.minValue(tableroSimulado,profundidadMax-1,alfa,beta);
            if ( posibleMov > alfa ) {
                alfa = posibleMov;
                movElegido = movimiento; //cargamos el movimiento en la variable global
                //hacemos lo de movElegido solo en alfa porque alfa son las jugadas de nuestro algoritmo y beta del rival
            }
            //&& alfa!==-100000 && beta!==100000
            this.movimientoElegido = movElegido;
            if (alfa >= beta) { //poda
                console.log('['+this.jugador+']profundidad: '+(4-profundidadMax)+' podado');
                //return beta;
                break;
            }
        }
        console.log('['+this.jugador+']profundidad: '+(4-profundidadMax)+' valor(alfa):'+ alfa);
        return alfa;
    }


    minValue(tableroActual,profundidadMax,alfa,beta){ //función min de minimax
        let tableroSimulado = new Tablero(tableroActual.table);
        if (profundidadMax <=0  || tableroActual.calcularResultado() != JUEGO_INCONCLUSO){ //cutOff Test
            return this.rewardJugada(tableroActual);
        }
        for (let movimiento of tableroActual.getAllJugadas(this.rival)) { 
            tableroSimulado.jugar(movimiento);
            beta = this.min(beta,this.maxValue(tableroSimulado,profundidadMax-1,alfa,beta));
            if (alfa >= beta) { //poda
                console.log('['+this.jugador+']profundidad: '+(4-profundidadMax)+' podado');
                //return alfa;
                break;
            }
        }
        console.log('['+this.jugador+']profundidad: '+(4-profundidadMax)+' valor(beta):'+ beta);
        return beta;
    }

    
    rewardJugada(tableroActual){ //función de reward de cada jugada que llega a las hojas del árbol
        let reward = 0;
        if (tableroActual.calcularResultado() === GANAN_BLANCAS) { //si ganan las blancas
            if (this.jugador === 2) { //si el jugador es blancas entonces gana
                reward = 100;
            } else { //pierde
                reward = -100;
            }
        } else if(tableroActual.calcularResultado() === GANAN_NEGRAS) { //si ganan las negras
            if (this.jugador === 1) { //si el jugador es negras entonces gana
                reward = 100;
            } else { //pierde
                reward = -100;
            } 
        } else{ //si la partida aún no termina
            //FALTA EL REWARD DE TENER MÁS PIEZAS HACIA LOS LATERALES Y EL DE TENER MÁS PIEZAS CUBRIENDOSE
            if (this.jugador === 2) { //si el jugador es blanco
                reward = this.rewardPiezasBlancas(tableroActual);
            } else { //si el jugador es negro
                reward = this.rewardPiezasNegras(tableroActual);
            }
            //reward += this.rewardPosBordes() +this.rewardCubrirAliado() +this.soplo();
        }
        return reward;
    }

    //subrutinas reward
        //asignaremos el mismo valor a comer que a coronar
    rewardPiezasBlancas(tableroActual){
        return 2*(tableroActual.cantPeonesBlancos - tableroActual.cantPeonesNegros) +
        (tableroActual.cantDamasBlancas-tableroActual.cantDamasNegras);
    }

    rewardPiezasNegras(tableroActual){
        return 2*(tableroActual.cantPeonesNegros - tableroActual.cantPeonesBlancos) +
        (tableroActual.cantDamasNegras-tableroActual.cantDamasBlancas);
    }

    //funciones extra
    max(a,b){
        if (a>=b) {
            return a;
        } else {
            return b;
        }
    }

    min(a,b){
        if (a<=b) {
            return a;
        } else {
            return b;
        }
    }

}
export default MinimaxPodaAlfaBeta;