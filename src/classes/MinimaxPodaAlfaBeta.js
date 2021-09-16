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

    jugar(tableroActual){
        //while (tableroActual.calcularResultado() == JUEGO_INCONCLUSO) {
            //movimiento del rival
            console.log("jugadas disponibles: "+tableroActual.getAllJugadas(rival)); //mostramos al rival sus jugadas disponibles
            console.log("jugada aleatoria elegida para jugar: "+ tableroActual.jugar());
            //movimiento del minimax
            return this.maxValue(tableroActual,this.profundidadMax,this.alfa,this.beta);
        //}
    }

    //funciones minimax
    maxValue(tableroActual,profundidadMax,alfa,beta){ //función max de minimax
        if (profundidadMax <=0 || tableroActual.calcularResultado() != JUEGO_INCONCLUSO){ 
            //cutOff Test: Si ya se llegó al valor de corte o si la partida ya termina
            return this.rewardJugada(tableroActual);
        }
        for (let movimiento in tableroActual.getAllJugadas(this.jugador)) { 
            alfa = max(alfa,minValue(movimiento,profundidadMax-1,alfa,beta));
            if (alfa >= beta) { //poda
                return beta;
            }
        }
        return alfa;
    }


    minValue(tableroActual,profundidadMax,alfa,beta){ //función min de minimax
        if (profundidadMax <=0  || tableroActual.calcularResultado() != JUEGO_INCONCLUSO){ //cutOff Test
            return this.rewardJugada(tableroActual);
        }
        for (let movimiento in tableroActual.getAllJugadas(this.rival)) { 
            beta = min(beta,maxValue(movimiento,profundidadMax-1,alfa,beta));
            if (alfa >= beta) { //poda
                return alfa;
            }
        }
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
                reward = (tableroActual.cantPeonesBlancos - tableroActual.cantPeonesNegros) +
                3*(tableroActual.cantDamasBlancas-tableroActual.cantDamasNegras);
            } else { //si el jugador es negro
                reward = (tableroActual.cantPeonesNegros - tableroActual.cantPeonesBlancos) +
                3*(tableroActual.cantDamasNegras-tableroActual.cantDamasBlancas);
            }
        }
        return reward;
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