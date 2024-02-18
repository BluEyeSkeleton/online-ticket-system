/**
 * Changes currently active navbar item.
 * @param {string} item Current navbar item.
 */
function activeNavItem(item) {
  document.getElementById(`navbar_${item}`).classList.add("active");
}
