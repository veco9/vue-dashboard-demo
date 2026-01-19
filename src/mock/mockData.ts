/**
 * Simulates API delay for mock data
 */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wraps mock data in a promise with simulated API delay
 */
export async function mockDataCallback<T>(data: T): Promise<T> {
  await delay(350);
  return new Promise((resolve) => {
    resolve(data);
  });
}
