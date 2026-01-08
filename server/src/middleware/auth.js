// Authentication middleware

// Check if user is authenticated (guest or returning guest)
export function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

// Check if user is admin
export function requireAdmin(req, res, next) {
  if (!req.session || !req.session.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Check if user is a returning guest (has account)
export function requireReturningGuest(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (!req.session.user.is_returning_guest) {
    return res.status(403).json({ error: 'Account required for this action' });
  }
  next();
}

// Admin code constant
export const ADMIN_CODE = '5250';
