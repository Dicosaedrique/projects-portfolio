import BenchMarkWorker, { BenchmarkResults } from "./Benchmark.worker";

// classe de benchmark à utiliser côté client pour appeller le benchmark côté worker
export default class Benchmark {
    onStart?: (total: number) => void;
    onProgress?: (current: number, total: number) => void;
    onEnd?: (results: BenchmarkResults) => void;

    private worker: Worker;

    constructor() {
        this.worker = new BenchMarkWorker(""); // créer un worker (grâce à "worker-loader")

        // ajout du listener de message
        this.worker.onmessage = (event: MessageEvent<any>) => {
            const { message, data } = event.data;

            if (typeof message === "string") {
                switch (message) {
                    case "start":
                        if (this.onStart) this.onStart(data);
                        break;
                    case "progress":
                        const { current, total } = data;
                        if (this.onProgress) this.onProgress(current, total);
                        break;
                    case "end":
                        if (this.onEnd) this.onEnd(data);
                        break;
                }
            } else {
                console.log(event.data);
            }
        };
    }

    start() {
        this.worker.postMessage("start");
    }
}
