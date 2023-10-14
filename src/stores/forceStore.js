import { defineStore } from "pinia";
import { useStateStore } from "./stateStore";
import { useTransitionStore } from "./transitionStore";
import * as d3 from 'd3';

export const useForceStore = defineStore('force', () => {

    const stateStore = useStateStore(),
        transitionStore = useTransitionStore();

    const centerForce = d3.forceCenter(100, 100).strength(0.05);

    const simulation = d3.forceSimulation()
        .stop()
        .alphaDecay(0)
        .alpha(.5)
        .alphaTarget(0.7)
        .force('repel', d3.forceManyBody().strength(-5))
        .force('center', centerForce);


    const tick = () => {
        simulation.restart();
        simulation.tick(1);
    }

    window.s = simulation;


    const update = () => {
        // Get all states
        const states = stateStore.states,
            transitions = transitionStore.transitions;

        simulation.nodes([...states])
            .force('link', 
            d3.forceLink(
                [...transitions.filter(t => t.from.label !== t.to.label)])
            .distance(() => 150)
            );
    }   

    const setDimensions = (x, y) => {
        centerForce.x(x / 2);
        centerForce.y(y / 2);
    }

    const stop = () => simulation.stop();

    return {
        tick,
        update,
        stop,
        setDimensions
    }
})