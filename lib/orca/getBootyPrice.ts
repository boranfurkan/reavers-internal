const WHIRLPOOL_ADDRESS = `CudYprfpy4GMLGzQGAnjeDfau9gJhdmQ3FKdGXPXhkav`;


export const getBootyPriceInSOL = async () => {
  try {
    // const result = await fetch("https://api.solscan.io/protocol/address/info?address=" + WHIRLPOOL_ADDRESS);
    // const jsonData = await result.json();

    // return jsonData.data?.price || 0;
    return 0;
  } catch (err: any) {
    console.log(err.toString());
    return NaN;
  }
};