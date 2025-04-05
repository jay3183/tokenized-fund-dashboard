// Test GraphQL query using dynamic import
const main = async () => {
  const fetch = (await import('node-fetch')).default;

  try {
    const response = await fetch('http://localhost:4000', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query {
            allFunds {
              id
              name
              chainId
              currentNav
              currentNAV {
                nav
                timestamp
              }
              intradayYield
            }
          }
        `,
      }),
    });

    const json = await response.json();
    console.log(JSON.stringify(json, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
};

main(); 