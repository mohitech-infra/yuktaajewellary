import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

const STEPS = { FORM: "FORM", SUMMARY: "SUMMARY", SUCCESS: "SUCCESS" };
const INITIAL_FORM = { customer_name: "", customer_phone: "", delivery_address: "", city: "", pincode: "", notes: "" };

export default function BuyOrderModal({ isOpen, product, onClose }) {
  const [step, setStep] = useState(STEPS.FORM);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) { setStep(STEPS.FORM); setForm(INITIAL_FORM); setErrors({}); setIsSubmitting(false); }
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const validate = () => {
    const e = {};
    if (!form.customer_name.trim()) e.customer_name = "Name is required";
    if (!/^[6-9]\d{9}$/.test(form.customer_phone.trim())) e.customer_phone = "Enter a valid 10-digit Indian mobile number";
    if (!form.delivery_address.trim()) e.delivery_address = "Address is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!/^\d{6}$/.test(form.pincode.trim())) e.pincode = "Enter a valid 6-digit pincode";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setStep(STEPS.SUMMARY);
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      await supabase.from("orders").insert({
        product_id: product.id,
        product_name: product.name,
        buy_price: product.buy_price,
        customer_name: form.customer_name.trim(),
        customer_phone: form.customer_phone.trim(),
        delivery_address: form.delivery_address.trim(),
        city: form.city.trim(),
        pincode: form.pincode.trim(),
        notes: form.notes.trim(),
        order_status: "Pending",
      });
    } catch (err) { console.error("Order save error:", err); }
    setIsSubmitting(false);
    setStep(STEPS.SUCCESS);
  };

  const handleWhatsApp = () => {
    const msg = `Hi Varsha! I d like to BUY the "${product.name}" from Yuktaa Jewellery.\n\nOrder Details:\n- Product: ${product.name}\n- Price: Rs ${product.buy_price?.toLocaleString("en-IN")}\n- Name: ${form.customer_name}\n- Phone: ${form.customer_phone}\n- Address: ${form.delivery_address}, ${form.city} - ${form.pincode}${form.notes ? `\n- Notes: ${form.notes}` : ""}\n\nPlease confirm my order and share payment details. Thank you!`;
    window.open(`https://wa.me/919987600673?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const currentStepNum = step === STEPS.FORM ? 1 : step === STEPS.SUMMARY ? 2 : 3;

  return (
    React.createElement("div", { className: "bom-overlay", onClick: (e) => { if (e.target === e.currentTarget && step !== STEPS.SUCCESS) onClose(); } },
      React.createElement("div", { className: "bom-modal" },
        step !== STEPS.SUCCESS && React.createElement("div", { className: "bom-header" },
          React.createElement("div", { className: "bom-header-left" },
            React.createElement("i", { className: "fa-solid fa-bag-shopping bom-header-icon" }),
            React.createElement("div", null,
              React.createElement("h2", { className: "bom-title" }, "Buy This Set"),
              React.createElement("p", { className: "bom-subtitle" }, product.name)
            )
          ),
          React.createElement("button", { className: "bom-close-btn", onClick: onClose }, React.createElement("i", { className: "fa-solid fa-xmark" }))
        ),
        step !== STEPS.SUCCESS && React.createElement("div", { className: "bom-progress" },
          ["Details", "Summary", "Confirm"].map((label, idx) =>
            React.createElement(React.Fragment, { key: label },
              React.createElement("div", { className: `bom-progress-step ${currentStepNum >= idx + 1 ? "active" : ""}` },
                React.createElement("div", { className: "bom-progress-dot" }, currentStepNum > idx + 1 ? React.createElement("i", { className: "fa-solid fa-check" }) : idx + 1),
                React.createElement("span", { className: "bom-progress-label" }, label)
              ),
              idx < 2 && React.createElement("div", { key: `line-${idx}`, className: `bom-progress-line ${currentStepNum > idx + 1 ? "active" : ""}` })
            )
          )
        ),
        step === STEPS.FORM && React.createElement("form", { className: "bom-form", onSubmit: handleFormSubmit, noValidate: true },
          React.createElement("div", { className: "bom-product-strip" },
            React.createElement("div", { className: "bom-product-img", style: { backgroundImage: `url("${product.img}")` } }),
            React.createElement("div", { className: "bom-product-info" },
              React.createElement("span", { className: "bom-product-category" }, product.categoryTag),
              React.createElement("span", { className: "bom-product-name" }, product.name),
              React.createElement("span", { className: "bom-product-price" }, `Rs ${product.buy_price?.toLocaleString("en-IN")}`)
            )
          ),
          React.createElement("h3", { className: "bom-section-label" }, "Delivery Details"),
          React.createElement("div", { className: "bom-form-grid" },
            React.createElement("div", { className: "bom-field" },
              React.createElement("label", { className: "bom-label" }, "Full Name *"),
              React.createElement("input", { className: `bom-input${errors.customer_name ? " error" : ""}`, type: "text", name: "customer_name", placeholder: "Your full name", value: form.customer_name, onChange: handleChange }),
              errors.customer_name && React.createElement("span", { className: "bom-error" }, errors.customer_name)
            ),
            React.createElement("div", { className: "bom-field" },
              React.createElement("label", { className: "bom-label" }, "Mobile Number *"),
              React.createElement("input", { className: `bom-input${errors.customer_phone ? " error" : ""}`, type: "tel", name: "customer_phone", placeholder: "10-digit mobile number", value: form.customer_phone, onChange: handleChange, maxLength: 10 }),
              errors.customer_phone && React.createElement("span", { className: "bom-error" }, errors.customer_phone)
            )
          ),
          React.createElement("div", { className: "bom-field" },
            React.createElement("label", { className: "bom-label" }, "Delivery Address *"),
            React.createElement("textarea", { className: `bom-input bom-textarea${errors.delivery_address ? " error" : ""}`, name: "delivery_address", placeholder: "Flat/House No., Street, Landmark, Area", value: form.delivery_address, onChange: handleChange, rows: 3 }),
            errors.delivery_address && React.createElement("span", { className: "bom-error" }, errors.delivery_address)
          ),
          React.createElement("div", { className: "bom-form-grid" },
            React.createElement("div", { className: "bom-field" },
              React.createElement("label", { className: "bom-label" }, "City *"),
              React.createElement("input", { className: `bom-input${errors.city ? " error" : ""}`, type: "text", name: "city", placeholder: "City", value: form.city, onChange: handleChange }),
              errors.city && React.createElement("span", { className: "bom-error" }, errors.city)
            ),
            React.createElement("div", { className: "bom-field" },
              React.createElement("label", { className: "bom-label" }, "Pincode *"),
              React.createElement("input", { className: `bom-input${errors.pincode ? " error" : ""}`, type: "text", name: "pincode", placeholder: "6-digit pincode", value: form.pincode, onChange: handleChange, maxLength: 6 }),
              errors.pincode && React.createElement("span", { className: "bom-error" }, errors.pincode)
            )
          ),
          React.createElement("div", { className: "bom-field" },
            React.createElement("label", { className: "bom-label" }, "Order Notes (optional)"),
            React.createElement("textarea", { className: "bom-input bom-textarea", name: "notes", placeholder: "Any special instructions, gifting notes...", value: form.notes, onChange: handleChange, rows: 2 })
          ),
          React.createElement("div", { className: "bom-notice" },
            React.createElement("i", { className: "fa-solid fa-circle-info" }),
            React.createElement("span", null, "Payment is arranged via WhatsApp after confirming your order. We accept UPI, bank transfer, and cash on delivery.")
          ),
          React.createElement("button", { type: "submit", className: "bom-btn-primary" }, "Review Order ", React.createElement("i", { className: "fa-solid fa-arrow-right" }))
        ),
        step === STEPS.SUMMARY && React.createElement("div", { className: "bom-summary" },
          React.createElement("div", { className: "bom-summary-card" },
            React.createElement("div", { className: "bom-summary-img", style: { backgroundImage: `url("${product.img}")` } }),
            React.createElement("div", { className: "bom-summary-product-info" },
              React.createElement("span", { className: "bom-product-category" }, product.categoryTag),
              React.createElement("span", { className: "bom-product-name" }, product.name),
              React.createElement("span", { className: "bom-summary-includes" }, product.includes)
            )
          ),
          React.createElement("div", { className: "bom-summary-rows" },
            React.createElement("div", { className: "bom-summary-row" }, React.createElement("span", { className: "bom-summary-key" }, "Customer"), React.createElement("span", { className: "bom-summary-val" }, form.customer_name)),
            React.createElement("div", { className: "bom-summary-row" }, React.createElement("span", { className: "bom-summary-key" }, "Mobile"), React.createElement("span", { className: "bom-summary-val" }, form.customer_phone)),
            React.createElement("div", { className: "bom-summary-row" }, React.createElement("span", { className: "bom-summary-key" }, "Address"), React.createElement("span", { className: "bom-summary-val" }, `${form.delivery_address}, ${form.city} - ${form.pincode}`)),
            form.notes && React.createElement("div", { className: "bom-summary-row" }, React.createElement("span", { className: "bom-summary-key" }, "Notes"), React.createElement("span", { className: "bom-summary-val" }, form.notes))
          ),
          React.createElement("div", { className: "bom-summary-total" },
            React.createElement("span", null, "Total Amount"),
            React.createElement("span", { className: "bom-total-price" }, `Rs ${product.buy_price?.toLocaleString("en-IN")}`)
          ),
          React.createElement("div", { className: "bom-notice bom-notice-amber" },
            React.createElement("i", { className: "fa-solid fa-truck-fast" }),
            React.createElement("span", null, "Payment will be confirmed via WhatsApp after placing the order. Shipping details will be shared by Varsha.")
          ),
          React.createElement("div", { className: "bom-summary-actions" },
            React.createElement("button", { className: "bom-btn-secondary", onClick: () => setStep(STEPS.FORM) }, React.createElement("i", { className: "fa-solid fa-arrow-left" }), " Edit Details"),
            React.createElement("button", { className: "bom-btn-primary", onClick: handlePlaceOrder, disabled: isSubmitting },
              isSubmitting ? React.createElement(React.Fragment, null, React.createElement("i", { className: "fa-solid fa-spinner fa-spin" }), " Placing...") : React.createElement(React.Fragment, null, React.createElement("i", { className: "fa-solid fa-check" }), " Place Order")
            )
          )
        ),
        step === STEPS.SUCCESS && React.createElement("div", { className: "bom-success" },
          React.createElement("div", { className: "bom-success-icon-wrap" },
            React.createElement("i", { className: "fa-solid fa-circle-check bom-success-icon" })
          ),
          React.createElement("h2", { className: "bom-success-title" }, "Order Placed!"),
          React.createElement("p", { className: "bom-success-msg" },
            "Your order for ", React.createElement("strong", null, product.name), " has been recorded. Varsha will reach out to confirm payment and shipping details."
          ),
          React.createElement("div", { className: "bom-success-detail-card" },
            React.createElement("div", { className: "bom-success-detail-row" }, React.createElement("i", { className: "fa-solid fa-user" }), React.createElement("span", null, form.customer_name)),
            React.createElement("div", { className: "bom-success-detail-row" }, React.createElement("i", { className: "fa-solid fa-location-dot" }), React.createElement("span", null, `${form.delivery_address}, ${form.city} - ${form.pincode}`)),
            React.createElement("div", { className: "bom-success-detail-row" }, React.createElement("i", { className: "fa-solid fa-indian-rupee-sign" }), React.createElement("span", null, `Rs ${product.buy_price?.toLocaleString("en-IN")}`))
          ),
          React.createElement("button", { className: "bom-btn-whatsapp", onClick: handleWhatsApp },
            React.createElement("i", { className: "fa-brands fa-whatsapp", style: { fontSize: "1.4rem" } }), " Confirm via WhatsApp"
          ),
          React.createElement("button", { className: "bom-btn-ghost", onClick: onClose }, "Continue Shopping")
        )
      )
    )
  );
}
