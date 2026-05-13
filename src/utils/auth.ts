export const auth = {
  get token() {
    return localStorage.getItem("token");
  },

  get isAuthenticated() {
    return !!this.token;
  },
};
