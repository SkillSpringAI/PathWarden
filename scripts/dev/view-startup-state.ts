import { loadStartupState } from "../../core/tasks/startupState";

const state = loadStartupState();
console.log(JSON.stringify(state, null, 2));
