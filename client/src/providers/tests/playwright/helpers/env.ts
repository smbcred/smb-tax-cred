export async function setLawRegime(page) {
  await page.addInitScript(() => {
    // emulate client env via localStorage if needed
    localStorage.setItem('VITE_LAW_REGIME', 'OBBBA_174A_EXPENSE');
  });
}