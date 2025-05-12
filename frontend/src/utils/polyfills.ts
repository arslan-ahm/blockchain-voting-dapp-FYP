import { Buffer } from "buffer";

(window as typeof window).global = window;

(window as typeof window & { Buffer: typeof Buffer }).Buffer = Buffer;