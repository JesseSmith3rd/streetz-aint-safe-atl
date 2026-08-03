document.addEventListener('DOMContentLoaded', () => {
  const crewName = document.getElementById('crewName');
  const crewMachine = document.getElementById('crewMachine');
  const crewSector = document.getElementById('crewSector');
  const crewDiscipline = document.getElementById('crewDiscipline');
  const coalitionForm = document.getElementById('coalitionForm');
  const onboardingContainer = document.getElementById('onboardingContainer');

  if (!crewName || !crewMachine || !crewSector || !crewDiscipline || !coalitionForm || !onboardingContainer) {
    return;
  }

  coalitionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nameVal = crewName.value.trim();
    const machineVal = crewMachine.value.trim();
    const sectorVal = crewSector.value.trim();
    const disciplineVal = crewDiscipline.value;
    
    // Validate inputs locally
    if (!nameVal || !machineVal || !sectorVal || !disciplineVal) {
      return;
    }
    
    if (nameVal.length > 50 || machineVal.length > 100 || sectorVal.length > 100) {
      return;
    }

    // Do NOT log any form values (Rule 19)

    // Transition to Success State with localized status indication (Rule 20)
    onboardingContainer.innerHTML = '';
    
    const successDiv = document.createElement('div');
    successDiv.className = 'coalition-success';
    successDiv.style.minHeight = '200px';
    
    const iconWrap = document.createElement('div');
    iconWrap.className = 'success-icon-wrap';
    iconWrap.style.color = '#1abc9c';
    iconWrap.style.borderColor = '#1abc9c';
    iconWrap.style.backgroundColor = 'rgba(26,188,156,0.1)';
    iconWrap.textContent = '✓';
    successDiv.appendChild(iconWrap);
    
    const title = document.createElement('h2');
    title.style.marginBottom = '12px';
    title.style.fontFamily = 'var(--font-heading)';
    title.style.fontSize = '20px';
    title.style.textAlign = 'center';
    title.textContent = 'Dossier Validated';
    successDiv.appendChild(title);
    
    const msg = document.createElement('p');
    msg.style.color = 'var(--text-muted)';
    msg.style.fontSize = '14px';
    msg.style.maxWidth = '400px';
    msg.style.lineHeight = '1.6';
    msg.style.margin = '0 auto';
    msg.style.textAlign = 'center';
    msg.textContent = 'Your operator information has been validated locally but was not transmitted. Hold the line.';
    successDiv.appendChild(msg);
    
    onboardingContainer.appendChild(successDiv);
  });
});
