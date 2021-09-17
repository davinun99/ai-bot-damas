import Tablero from 'src/classes/Tablero.js';
import {GANAN_BLANCAS, GANAN_NEGRAS, JUEGO_INCONCLUSO} from '../helpers/constants';

class MinimaxPodaAlfaBeta {
    tableroActual = new Tablero();
    alfa = -100000; 
    beta = 100000;
    profundidadMax = 4; //cantidad de niveles del árbol que como máximo bajará
    jugador = 2; //asumo que jugador es blancas (2)
    rival = 1; //asumo que es negras (1) el rival

    constructor(){}

    jugar(){
        //while (tableroActual.calcularResultado() == JUEGO_INCONCLUSO) {
        for (let index = 0; index < 20; index++) {
            this.tableroActual.dibujarTablero();
            //movimiento del rival
            console.log(index+") cantidad de fichas: "+this.tableroActual.cantFichasBlancas+" blancas y "+this.tableroActual.cantFichasNegras+" negras"); //mostramos al rival sus jugadas disponibles
            console.log("se elegira una jugada random entre las disponibles ");
            this.tableroActual.jugarRandom(this.rival);
            //movimiento del minimax
            console.log("print minimax: "+this.maxValue(this.tableroActual,this.profundidadMax,this.alfa,this.beta));
            this.tableroActual.jugarRandom(this.jugador);
        }
    }

    //funciones minimax
    maxValue(tableroActual,profundidadMax,alfa,beta){ //función max de minimax
        //tablero que simulará la jugada y la pasará al siguiente elemento
        let tableroSimulado = new Tablero(tableroActual.table);
        if (profundidadMax <=0 || tableroActual.calcularResultado() != JUEGO_INCONCLUSO){ 
            //cutOff Test: Si ya se llegó al valor de corte o si la partida ya termina
            return this.rewardJugada(tableroActual);
        }
        for (let movimiento of tableroActual.getAllJugadas(this.jugador)) { 
            //Jugamos cada movimiento y lo pasamos como parámetro al siguiente nivel del arbol
            tableroSimulado.jugar(movimiento);
            alfa = this.max(alfa,this.minValue(tableroSimulado,profundidadMax-1,alfa,beta));
            if (alfa >= beta) { //poda
                return beta;
            }
        }
        console.log('profundidad: '+(4-profundidadMax)+' valor(alfa):'+ alfa);
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
                return alfa;
            }
        }
        console.log('profundidad: '+(4-profundidadMax)+' valor(beta):'+ beta);
        return beta;
    }

    
    rewardJugada(tableroActual){ //función de reward de cada jugada que llega a las hojas del árbol
        let reward = 0;
        if (tableroActual.calcularResultado() == GANAN_BLANCAS) { //si ganan las blancas
            if (this.jugador == 2) { //si el jugador es blancas entonces gana
                reward = 100;
            } else { //pierde
                reward = -100;
            }
        } else if(tableroActual.calcularResultado() == GANAN_NEGRAS) { //si ganan las negras
            if (this.jugador == 1) { //si el jugador es negras entonces gana
                reward = 100;
            } else { //pierde
                reward = -100;
            } 
        } else{ //si la partida aún no termina
            //asignaremos a las fichas coronadas un valor de 3 veces una ficha normal
            //FALTA EL REWARD DE TENER MÁS PIEZAS HACIA LOS LATERALES Y EL DE TENER MÁS PIEZAS CUBRIENDOSE
            if (this.jugador == 2) { //si el jugador es blanco
                reward += this.rewardPiezasBlancas(tableroActual);
            } else { //si el jugador es negro
                reward += this.rewardPiezasNegras(tableroActual);
            }
            //reward += this.rewardPosBordes() +this.rewardCubrirAliado() +this.soplo();
        }
        return reward;
    }

    //subrutinas reward
    rewardPiezasBlancas(tableroActual){
        return (tableroActual.cantPeonesBlancos - tableroActual.cantPeonesNegros) +
        3*(tableroActual.cantDamasBlancas-tableroActual.cantDamasNegras);
    }

    rewardPiezasNegras(tableroActual){
        return (tableroActual.cantPeonesNegros - tableroActual.cantPeonesBlancos) +
        3*(tableroActual.cantDamasNegras-tableroActual.cantDamasBlancas);
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