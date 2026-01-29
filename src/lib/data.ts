import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  getDoc,
  orderBy,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, app } from '@/firebase';
import type { Order, Employee, OrderStatus, ChecklistItems, User } from './types';

// Simulate API latency
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function getOrders(searchTerm?: string): Promise<Order[]> {
  const ordersRef = collection(db, 'orders');
  let q = query(ordersRef, orderBy('date', 'desc'));

  const querySnapshot = await getDocs(q);
  let orders: Order[] = [];
  querySnapshot.forEach((doc) => {
    orders.push({ id: doc.id, ...doc.data() } as Order);
  });

  if (searchTerm) {
    const lowercasedTerm = searchTerm.toLowerCase();
    orders = orders.filter(
      (o) =>
        o.client.toLowerCase().includes(lowercasedTerm) ||
        o.service.toLowerCase().includes(lowercasedTerm) ||
        o.id.toLowerCase().includes(lowercasedTerm)
    );
  }

  return orders;
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const docRef = doc(db, 'orders', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Order;
  } else {
    return undefined;
  }
}

export async function createOrder(
  orderData: Omit<Order, 'id' | 'date' | 'status' | 'checklist' | 'updatedAt' | 'lastUpdatedBy' | 'certificateFile' | 'certificateUrl'>,
  user: User,
  certificate?: File
): Promise<Order> {
    const ordersRef = collection(db, "orders");
    const querySnapshot = await getDocs(ordersRef);
    let maxId = 0;
    querySnapshot.forEach((doc) => {
        const id = parseInt(doc.id, 10);
        if (!isNaN(id) && id > maxId) {
            maxId = id;
        }
    });

    const newOrderId = (maxId + 1).toString();
    const newOrderRef = doc(db, "orders", newOrderId);

    const newOrder: Order = {
        ...orderData,
        id: newOrderId,
        date: new Date().toISOString(),
        status: 'Pendente',
        checklist: {
            importacaoProdutos: false,
            adicionaisOpcionais: false,
            codigoPDV: false,
            preco: false,
            bairros: false,
            imagens: false,
            fiscal: false,
        },
        lastUpdatedBy: user.name,
        updatedAt: new Date().toISOString(),
        certificateFile: certificate ? `(Enviando...) ${certificate.name}` : '',
        certificateUrl: '',
    };

    // Save the document immediately, so the user gets instant feedback
    await setDoc(newOrderRef, newOrder);

    // If there's a certificate, upload it in the background and update the doc when done.
    // This part is "fire and forget" from the user's perspective.
    if (certificate) {
      const storage = getStorage(app);
      const storageRef = ref(storage, `certificates/${newOrderId}/${certificate.name}`);
      
      uploadBytes(storageRef, certificate).then(snapshot => {
        getDownloadURL(snapshot.ref).then(downloadURL => {
          // Now update the document with the real file name and URL
          updateDoc(newOrderRef, {
            certificateFile: certificate.name,
            certificateUrl: downloadURL
          });
        });
      }).catch(error => {
        console.error("Upload failed", error);
        // Update the document to show that the upload failed, including the error message.
        updateDoc(newOrderRef, {
            certificateFile: `(Falha no envio) ${certificate.name}`,
            description: `Falha no upload do certificado: ${error.message}\n\n${newOrder.description || ''}`
        });
      });
    }

    // Return the optimistically created order.
    return newOrder;
}


export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  updatedBy: string
): Promise<Order | undefined> {
  const orderRef = doc(db, 'orders', id);
  await updateDoc(orderRef, {
    status: status,
    lastUpdatedBy: updatedBy,
    updatedAt: new Date().toISOString(),
  });
  return getOrderById(id);
}

export async function updateOrderChecklist(
  id: string,
  checklist: ChecklistItems,
  updatedBy: User
): Promise<Order | undefined> {
  const orderRef = doc(db, 'orders', id);
  await updateDoc(orderRef, {
    checklist: checklist,
    lastUpdatedBy: updatedBy.name,
    updatedAt: new Date().toISOString(),
  });
  return getOrderById(id);
}

export async function updateOrderDescription(
  id: string,
  description: string,
  updatedBy: User
): Promise<Order | undefined> {
  const orderRef = doc(db, 'orders', id);
  await updateDoc(orderRef, {
    description: description,
    lastUpdatedBy: updatedBy.name,
    updatedAt: new Date().toISOString(),
  });
  return getOrderById(id);
}

export async function deleteOrder(id: string): Promise<{ success: boolean }> {
  await deleteDoc(doc(db, 'orders', id));
  return { success: true };
}

export async function getEmployees(): Promise<Employee[]> {
  const employeesRef = collection(db, 'employees');
  const querySnapshot = await getDocs(employeesRef);
  const employees: Employee[] = [];
  querySnapshot.forEach((doc) => {
    employees.push(doc.data().name);
  });
  return employees;
}

export async function addEmployee(name: Employee): Promise<Employee> {
    const employeesRef = collection(db, 'employees');
    const q = query(employeesRef, where("name", "==", name));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        throw new Error('Técnico já existe.');
    }
    const newEmployeeRef = doc(employeesRef);
    await setDoc(newEmployeeRef, { name });
    return name;
}

export async function deleteEmployee(name: Employee): Promise<{ success: boolean }> {
    const employeesRef = collection(db, 'employees');
    const q = query(employeesRef, where("name", "==", name));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        throw new Error('Técnico não encontrado.');
    }

    const docToDelete = querySnapshot.docs[0];
    await deleteDoc(docToDelete.ref);

    // Unassign from any orders
    const ordersRef = collection(db, 'orders');
    const ordersQuery = query(ordersRef, where("assignedTo", "==", name));
    const ordersSnapshot = await getDocs(ordersQuery);
    ordersSnapshot.forEach(async (orderDoc) => {
        await updateDoc(orderDoc.ref, { assignedTo: '' });
    });

    return { success: true };
}

export async function getOrderStats() {
  const orders = await getOrders();
  return {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'Pendente').length,
    ongoing: orders.filter((o) => o.status === 'Em Andamento').length,
    completed: orders.filter((o) => o.status === 'Concluída').length,
  };
}
