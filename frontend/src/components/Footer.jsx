export default function Footer() {
  return (
    <footer className="py-8 border-t border-border bg-card text-center text-muted-foreground">
      <p>&copy; {new Date().getFullYear()} LeaveFlow. All rights reserved.</p>
    </footer>
  );
}
