# Import all the models, so that Base has them registered
# and Alembic can find them automatically.

from app.models.node import Device, Node
from app.models.reservation import Reservation, ReservationDevice
from app.models.user import SSHKey, User
