import { auth } from '@/lib/firebase';

// A simple promise-based lock so we never hammer getIdToken(true)
class AuthService {
  private refreshing: Promise<string> | null = null;

  /**
   * Always returns a valid ID token.
   * If a force-refresh is already in flight, reuses it.
   */
  async getToken(forceRefresh = false): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    // If they asked for a forceRefresh, but we already are doing one, just return that.
    if (forceRefresh && this.refreshing) {
      return this.refreshing;
    }

    // If no forceRefresh, just use the cached token promise
    if (!forceRefresh) {
      return await user.getIdToken();
    }

    // forceRefresh = true, no existing call → do it once
    this.refreshing = user.getIdToken(/* forceRefresh */ true)
      .finally(() => { this.refreshing = null; });
    return await this.refreshing;
  }
}

export const authService = new AuthService();
