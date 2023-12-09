export async function sorry() {
  try {
    const response = await fetch(
      "https://api.otakugifs.xyz/gif?reaction=sorry",
    );

    const responseData = (await response.json()) as any;

    return responseData.url as string;
  } catch (error) {
    console.error("Error querying AniList API:", error);
  }
}
