const user = {
  name_length:{
    min:4,
    max:50
  },
  pass_length:{
    min:4,
    max:50
  }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = {user: user};
} else {
  window.config = {user: user};
}
