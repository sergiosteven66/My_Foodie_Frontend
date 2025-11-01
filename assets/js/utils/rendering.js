export function renderEstrellas(rankingPonderado) {
    if (!rankingPonderado || rankingPonderado === 0) {
        return '<span class="text-muted small">Sin calificar</span>';
    }

    const scoreDecimal = rankingPonderado.toFixed(1);
    const scoreRedondeado = Math.round(scoreDecimal * 2) / 2; 

    let estrellasHTML = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= scoreRedondeado) {
            estrellasHTML += '<i class="bi bi-star-fill text-primary"></i>';
        } else if (i - 0.5 === scoreRedondeado) {
            estrellasHTML += '<i class="bi bi-star-half text-primary"></i>';
        } else {
            estrellasHTML += '<i class="bi bi-star text-primary"></i>';
        }
    }

    return `
      <span class="fw-bold text-dark me-2">${scoreDecimal}</span>
      ${estrellasHTML}
    `;
}

export function renderEstrellasSimples(calificacion) {
  let estrellasHTML = '';
  for (let i = 1; i <= 5; i++) {
    estrellasHTML += `<i class="bi bi-star${i <= calificacion ? '-fill' : ''} text-primary"></i>`;
  }
  return estrellasHTML;
}