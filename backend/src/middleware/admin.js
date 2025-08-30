// backend/src/middleware/admin.js
export default function admin(req, res, next) {
  if (!req.user) {
    console.error("❌ Admin middleware: No user in request");
    return res.status(401).json({ error: "Authentication required" });
  }
  if (!req.user.isAdmin) {
    console.error(`❌ Admin middleware: User ${req.user.id} lacks admin privileges`);
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}