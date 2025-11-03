// NotificationService.jsx - Simple notification system for patient notifications

class NotificationService {
  constructor() {
    this.notifications = this.loadNotifications();
    this.listeners = [];
  }

  // Load notifications from localStorage
  loadNotifications() {
    try {
      const stored = localStorage.getItem('patient_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load notifications:', error);
      return [];
    }
  }

  // Save notifications to localStorage
  saveNotifications() {
    try {
      localStorage.setItem('patient_notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

  // Add a new notification
  addNotification(patientEmail, message, type = 'info') {
    const notification = {
      id: Date.now() + Math.random(),
      patientEmail,
      message,
      type, // 'success', 'info', 'warning', 'error'
      time: new Date().toLocaleString(),
      read: false,
      timestamp: Date.now()
    };

    this.notifications.unshift(notification);
    this.saveNotifications();
    this.notifyListeners();
    
    return notification;
  }

  // Get notifications for a specific patient
  getNotificationsForPatient(patientEmail) {
    return this.notifications.filter(n => n.patientEmail === patientEmail);
  }

  // Mark notification as read
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
      this.notifyListeners();
    }
  }

  // Mark all notifications as read for a patient
  markAllAsRead(patientEmail) {
    this.notifications
      .filter(n => n.patientEmail === patientEmail)
      .forEach(n => n.read = true);
    this.saveNotifications();
    this.notifyListeners();
  }

  // Get unread count for a patient
  getUnreadCount(patientEmail) {
    return this.notifications.filter(n => n.patientEmail === patientEmail && !n.read).length;
  }

  // Subscribe to notification changes
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  // Notify all listeners of changes
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.notifications));
  }

  // Clear old notifications (older than 30 days)
  clearOldNotifications() {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    this.notifications = this.notifications.filter(n => n.timestamp > thirtyDaysAgo);
    this.saveNotifications();
    this.notifyListeners();
  }

  // Appointment-specific notification methods
  notifyAppointmentApproved(patientEmail, appointmentDetails) {
    const message = `Your appointment on ${appointmentDetails.date} at ${appointmentDetails.time} has been approved by the doctor.`;
    return this.addNotification(patientEmail, message, 'success');
  }

  notifyAppointmentRejected(patientEmail, appointmentDetails) {
    const message = `Your appointment on ${appointmentDetails.date} at ${appointmentDetails.time} has been rejected. Please contact the clinic for more information.`;
    return this.addNotification(patientEmail, message, 'warning');
  }

  notifyAppointmentCancelled(patientEmail, appointmentDetails) {
    const message = `Your appointment on ${appointmentDetails.date} at ${appointmentDetails.time} has been cancelled.`;
    return this.addNotification(patientEmail, message, 'info');
  }

  notifyAppointmentRescheduled(patientEmail, oldDetails, newDetails) {
    const message = `Your appointment has been rescheduled from ${oldDetails.date} at ${oldDetails.time} to ${newDetails.date} at ${newDetails.time}.`;
    return this.addNotification(patientEmail, message, 'info');
  }
}

// Create a singleton instance
const notificationService = new NotificationService();

// Clean up old notifications on initialization
notificationService.clearOldNotifications();

export default notificationService;