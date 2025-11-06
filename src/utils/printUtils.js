// Print kitchen receipt
export const printKitchenReceipt = (order) => {
  const normalizedOrder = {
    id: order.id,
    timestamp: new Date(order.created_at || new Date()),
    pickupLocation: order.pickup_location || order.location_name || "Counter",
    customerInfo: {
      name: order.customer_name,
      phone: order.customer_phone,
    },
    items: order.items?.map(item => ({
      name: item.product_name,
      quantity: item.quantity,
      notes: item.special_instructions || "",
    })) || [],
  };

  const ts = normalizedOrder.timestamp;
  const printContent = `
    <html>
      <head>
        <title>Kitchen Order #${normalizedOrder.id}}</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none; }
          }
          
          body {
            font-family: 'Courier New', monospace;
            max-width: 350px;
            margin: 0 auto;
            padding: 20px;
            background: white;
          }
          
          .receipt-container {
            border: 2px solid #000;
            padding: 15px;
          }
          
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 3px dashed #000;
            padding-bottom: 15px;
          }
          
          .logo {
            max-width: 120px;
            height: auto;
            margin-bottom: 10px;
          }
          
          .kitchen-title {
            font-size: 24px;
            font-weight: bold;
            margin: 10px 0;
            letter-spacing: 2px;
            background: #000;
            color: white;
            padding: 8px;
          }
          
          .order-info {
            background: #f5f5f5;
            padding: 10px;
            margin-bottom: 15px;
            border: 2px solid #000;
          }
          
          .order-info p {
            margin: 5px 0;
            font-size: 14px;
          }
          
          .order-number {
            font-size: 20px;
            font-weight: bold;
            color: #d32f2f;
          }
          
          .items-section {
            margin: 20px 0;
          }
          
          .items-title {
            font-size: 18px;
            font-weight: bold;
            background: #000;
            color: white;
            padding: 8px;
            margin-bottom: 15px;
            text-align: center;
          }
          
          .item {
            background: #fff;
            border: 2px solid #000;
            padding: 12px;
            margin-bottom: 12px;
            page-break-inside: avoid;
          }
          
          .item-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #000;
          }
          
          .item-quantity {
            display: inline-block;
            background: #d32f2f;
            color: white;
            padding: 4px 12px;
            border-radius: 4px;
            font-weight: bold;
            margin-right: 8px;
          }
          
          .item-notes {
            background: #fffacd;
            border-left: 4px solid #ffd700;
            padding: 8px;
            margin-top: 8px;
            font-size: 13px;
          }
          
          .item-notes strong {
            color: #d32f2f;
          }
          
          .footer {
            border-top: 3px dashed #000;
            padding-top: 15px;
            margin-top: 20px;
            background: #f5f5f5;
            padding: 15px;
          }
          
          .footer p {
            margin: 8px 0;
            font-size: 14px;
          }
          
          .customer-name {
            font-size: 16px;
            font-weight: bold;
            color: #d32f2f;
          }
          
          .timestamp {
            text-align: center;
            font-size: 12px;
            color: #666;
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <img src="src/logo/sooicy-logo.png" alt="SooIcy Logo" class="logo" onerror="this.style.display='none'">
            <div class="kitchen-title">KITCHEN ORDER</div>
          </div>
          
          <div class="order-info">
            <p class="order-number">ORDER #${normalizedOrder.id}</p>
            <p><strong>Time:</strong> ${ts.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
            <p><strong>Date:</strong> ${ts.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
          </div>
          
          <div class="items-section">
            <div class="items-title">━━━ ITEMS TO PREPARE ━━━</div>
            ${normalizedOrder.items.map(item => `
              <div class="item">
                <div class="item-name">
                  <span class="item-quantity">${item.quantity}x</span>
                  ${item.name}
                </div>
                ${item.notes && item.notes !== 'None' ? `
                  <div class="item-notes">
                    <strong>⚠ SPECIAL NOTES:</strong> ${item.notes}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
          
          <div class="footer">
            <p><strong>📍 PICKUP:</strong> ${normalizedOrder.pickupLocation || 'Counter'}</p>
            <p><strong>👤 CUSTOMER:</strong> <span class="customer-name">${normalizedOrder.customerInfo?.name || 'Guest'}</span></p>
            ${normalizedOrder.customerInfo?.phone ? `<p><strong>📞 PHONE:</strong> ${normalizedOrder.customerInfo.phone}</p>` : ''}
          </div>
          
          <div class="timestamp">
            Printed: ${new Date().toLocaleString()}
          </div>
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=400,height=600');
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.print();
  printWindow.close();
};

// Print customer receipt
export const printCustomerReceipt = (order) => {
  const timestamp = order.created_at ? new Date(order.created_at) : new Date();

  const subtotal = parseFloat(order.subtotal || 0);
  const deliveryFee = parseFloat(order.delivery_fee || 0);
  const tax = parseFloat(order.tax || 0);
  const total = parseFloat(order.total || 0);

  const printContent = `
    <html>
      <head>
        <title>Receipt #${order.id}</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none; }
          }

          body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            max-width: 450px;
            margin: 0 auto;
            padding: 30px;
            background: white;
            color: #333;
          }

          .receipt-container {
            border: 1px solid #ddd;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            padding: 30px;
            border-top: 6px solid #F989B4;
            border-radius: 8px;
          }

          /* HEADER */
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #329AD5;
          }

          .logo {
            max-width: 150px;
            height: auto;
            margin-bottom: 15px;
          }

          .company-name {
            font-size: 32px;
            font-weight: bold;
            color: #329AD5;
            margin: 10px 0;
            letter-spacing: 2px;
          }

          .tagline {
            color: #F989B4;
            font-size: 14px;
            font-style: italic;
          }

          /* ORDER HEADER */
          .order-header {
            background-color: #329AD5;
            color: #fff;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 6px rgba(50, 154, 213, 0.3);
            text-align: center;
            font-weight: 500;
          }

          .order-id {
            font-size: 18px;
            font-weight: bold;
            color: #F989B4;
          }

          /* SECTION TITLES */
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #329AD5;
            margin: 20px 0 10px 0;
            padding-bottom: 5px;
            border-bottom: 2px solid #F989B4;
          }

          /* ITEMS */
          .items-list {
            margin: 15px 0;
          }

          .item-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px dashed #ddd;
          }

          .item-row:last-child {
            border-bottom: none;
          }

          .item-details {
            flex: 1;
          }

          .item-name {
            font-weight: 600;
            color: #333;
            margin-bottom: 4px;
          }

          .item-quantity {
            color: #666;
            font-size: 13px;
          }

          .item-price {
            font-weight: bold;
            color: #329AD5;
            white-space: nowrap;
          }

          /* TOTALS */
          .totals-section {
            background: #f9faff;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
            border: 1px solid #e2e8f0;
          }

          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
          }

          .subtotal-row {
            color: #666;
          }

          .final-total {
            border-top: 2px solid #F989B4;
            padding-top: 12px;
            margin-top: 12px;
            font-size: 20px;
            font-weight: bold;
            color: #329AD5;
          }

          /* FOOTER */
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #f0f0f0;
            text-align: center;
          }

          .thank-you {
            font-size: 18px;
            color: #F989B4;
            font-weight: bold;
            margin: 15px 0;
          }

          .note {
            font-size: 13px;
            color: #555;
            background: #fdf2f7;
            padding: 12px;
            border-left: 4px solid #F989B4;
            border-radius: 4px;
            margin: 15px 0;
          }

          .barcode {
            margin: 20px 0;
            text-align: center;
            font-family: 'Courier New', monospace;
            font-size: 24px;
            letter-spacing: 2px;
            color: #329AD5;
          }

          .contact-info {
            color: #666;
            font-size: 13px;
            margin-top: 15px;
          }

          .timestamp {
            text-align: center;
            color: #999;
            font-size: 11px;
            margin-top: 20px;
          }
        </style>
      </head>

      <body>
        <div class="receipt-container">
          <div class="header">
            <img src="src/logo/sooicy-logo.png" alt="SooIcy Logo" class="logo" onerror="this.style.display='none'">
            <div class="company-name">SooIcy</div>
            <div class="tagline">Fresh & Delicious Every Time</div>
          </div>

          <div class="order-header">
            <p class="order-id">Order #${order.id}</p>
            <p>📅 ${timestamp.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
            <p>🕐 ${timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>

          <div class="section-title">🧾 Order Summary</div>
          <div class="items-list">
            ${order.items.map(item => `
              <div class="item-row">
                <div class="item-details">
                  <div class="item-name">${item.product_name}</div>
                  <div class="item-quantity">Qty: ${item.quantity}</div>
                </div>
                <div class="item-price">Rs ${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}</div>
              </div>
            `).join('')}
          </div>

          <div class="totals-section">
            <div class="total-row subtotal-row">
              <span>Subtotal</span>
              <span>Rs ${subtotal.toFixed(2)}</span>
            </div>
            <div class="total-row subtotal-row">
              <span>Delivery Fee</span>
              <span>Rs ${deliveryFee.toFixed(2)}</span>
            </div>
            <div class="total-row subtotal-row">
              <span>Tax</span>
              <span>Rs ${tax.toFixed(2)}</span>
            </div>
            <div class="total-row final-total">
              <span>Total</span>
              <span>Rs ${total.toFixed(2)}</span>
            </div>
          </div>

          <div class="thank-you">💗 Thank You for Choosing SooIcy! 💙</div>

          <div class="note">
            We hope you enjoyed your meal!  
            Your satisfaction means the world to us.  
            Don’t forget to share your experience or visit us again soon!
          </div>

          <div class="barcode">
            ||||| ${order.id} |||||
          </div>

          <div class="footer">
            <div class="contact-info">
              <p>👤 ${order.customer_name || 'Guest'}</p>
              <p>📞 ${order.customer_phone || '(N/A)'}</p>
              <p>📧 ${order.customer_email || 'support@sooicy.com'}</p>
              <p>📍 ${order.delivery_address || 'Pickup from counter'}</p>
            </div>
            <div class="timestamp">
              Printed on: ${new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=500,height=700');
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.print();
  printWindow.close();
};

