// utils/wait-some-time.ts

export const waitSomeTime = (time: number = 0) => new Promise((resolve) => setTimeout(resolve, time));
