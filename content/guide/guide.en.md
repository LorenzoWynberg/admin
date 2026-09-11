# Admin Panel Guide

How to run Mandados day-to-day — from quoting through reconciliation.

<div class="lead">

**This guide is written for administrators** who dispatch, monitor, and close out orders in the Mandados panel. You'll learn how to process the entire lifecycle: receive customer requests, generate quotes, assign drivers, follow deliveries, and reconcile the final amounts with charges or credits.

</div>

### What is Mandados? {#what-is-mandados}

Mandados is a last-mile messenger logistics platform. Customers create orders from their mobile app saying what they need bought, picked up, or delivered; the admin panel manages that order across its entire lifecycle; the driver physically executes the route.

### Three apps, one panel {#three-apps}

| App                   | Who uses it               | Role                                                               |
| --------------------- | ------------------------- | ------------------------------------------------------------------ |
| **Customer** (mobile) | Individuals or businesses | Create orders, receive quotes, track delivery, rate.               |
| **Driver** (mobile)   | Salaried messengers       | Receive assigned routes, execute stops, capture proof of delivery. |
| **Admin Panel** (web) | Operations                | Quote, dispatch, monitor conflicts, reconcile, manage pricing.     |

<div class="callout info">
<strong>Drivers are on payroll</strong>
The dispatch goal is <em>bin-packing</em>: maximize stops per driver to minimize team size. We don't aim for "fair distribution" of trips — routes are packed as tightly as possible.
</div>

---

## Signing in {#signing-in}

The panel runs in any modern web browser. The sign-in screen asks for email and password.

<figure>
  <img src="/guide/screenshots/01-admin-login.png" alt="Panel sign-in screen" />
  <figcaption>Sign-in screen. Use the credentials provided by the operations team.</figcaption>
</figure>

### Changing language {#change-language}

The panel is available in **English**, **Spanish**, and **French**. Pick a language from the _Settings_ section; you can also change the URL by swapping the language code (`/en/...`, `/es/...`, `/fr/...`).

---

## Overview {#overview}

<figure>
  <img src="/guide/screenshots/02-panel.png" alt="Main dashboard overview" />
  <figcaption><em>Dashboard</em> — the day's snapshot with operational metrics.</figcaption>
</figure>

When you sign in you'll land on the main **Dashboard**. This page summarizes:

- Active, pending, and completed orders for the day.
- Drivers on route and available drivers.
- Quick revenue and volume metrics.

Use the dashboard as your daily starting point, but the real workbench is [**Needs Attention**](#needs-attention) — where everything actionable is concentrated.

### Sidebar menu {#sidebar-menu}

The primary navigation lives in the left rail. It's organized from most to least frequently used:

<div class="section-cards">
  <div class="card"><strong class="card-title">Dashboard</strong><p>Day-at-a-glance overview.</p></div>
  <div class="card"><strong class="card-title">Needs Attention</strong><p>Workbench — anything that needs manual action.</p></div>
  <div class="card"><strong class="card-title">Routes</strong><p>Live routes with drivers in motion.</p></div>
  <div class="card"><strong class="card-title">Orders</strong><p>Full order list with filters.</p></div>
  <div class="card"><strong class="card-title">Quotes</strong><p>History of generated quotes.</p></div>
  <div class="card"><strong class="card-title">Users</strong><p>Registered customers.</p></div>
  <div class="card"><strong class="card-title">Drivers</strong><p>Payroll staff.</p></div>
  <div class="card"><strong class="card-title">Businesses</strong><p>Corporate customers with negotiated pricing.</p></div>
  <div class="card"><strong class="card-title">Addresses</strong><p>Reusable address directory.</p></div>
  <div class="card"><strong class="card-title">Catalogs</strong><p>Products and prices for quoting.</p></div>
  <div class="card"><strong class="card-title">Pricing Rules</strong><p>Tariff configuration by distance, tier, window, etc.</p></div>
  <div class="card"><strong class="card-title">Notifications</strong><p>System events surfaced to operations.</p></div>
  <div class="card"><strong class="card-title">Audit Logs</strong><p>Who did what and when.</p></div>
  <div class="card"><strong class="card-title">Guide</strong><p>This manual, inside the panel.</p></div>
  <div class="card"><strong class="card-title">Settings</strong><p>Currencies, payment destinations, service windows, language.</p></div>
</div>

_Settings sits on its own at the foot of the rail, below the list._

---

## Needs Attention <span class="pill green">the most important screen</span> {#needs-attention}

**This is the screen where an administrator spends most of the day.** Anything that needs manual intervention shows up here — an order, or an account's bill — organized into tabs by action type.

<figure>
  <img src="/guide/screenshots/22-needs-attention.png" alt="Needs Attention tabs" />
  <figcaption><em>Needs Attention</em> tabs. The number on each tab shows how many orders are waiting for action. This capture predates the sixth tab — the current list is the table below.</figcaption>
</figure>

### The tabs {#tabs}

They read left to right, and the table below has one row per tab — if the panel shows you a tab this table doesn't name, the guide is out of date and worth reporting.

| Tab                 | What it holds                                                                                                                                                                                    | Expected action                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| **Conflicts**       | Orders the system couldn't dispatch automatically or that hit feasibility issues (impossible window, no driver available, distance out of range).                                                | Review the reason, reassign manually, adjust the window, or dismiss the order.                       |
| **Reconciliation**  | <span class="pill blue">Completed</span> orders where the driver delivered but the charged amount must be adjusted to match the actual purchase price.                                           | Open the reconciliation dialog, enter the real per-line prices, generate the final quote.            |
| **Not Yet Quoted**  | Orders the customer just created that don't have a quote yet.                                                                                                                                    | Verify each stop's address, create the quote, and send it to the customer.                           |
| **Not Yet Paid**    | Two groups, one under the other: orders that have a quote and are still unpaid, and orders set to collect on delivery (the driver takes the money at the door, in cash or by SINPE Móvil).       | Follow up on collection, mark as paid when settled.                                                  |
| **Refund Requests** | Customer claims requesting a full or partial refund.                                                                                                                                             | Review evidence (proof of delivery, photos), approve or reject.                                      |
| **Period bills**    | Bills of accounts billed by period instead of per order: a declared payment waiting to be checked, a bill past its due date, a bill quietly unpaid, or a card charge the gateway never resolved. | [Work the bill](#period-bills) — verify the declaration, or record the payment that already arrived. |

<div class="callout warn">
<strong>An on-account order is not an unpaid order</strong>
Orders billed to an account never appear in <em>Not Yet Paid</em>. They carry <span class="pill blue">On Account</span>, which means somebody <em>is</em> paying for them — on a period bill. Chase those from the <em>Period bills</em> tab, not this one.
</div>

### Severity filters {#severity-filters}

Inside each tab, orders are prioritized by severity: <span class="pill red">Critical</span> <span class="pill amber">High</span> <span class="pill blue">Medium</span> <span class="pill gray">Low</span>. The filters at the top let you focus the day's work.

<div class="callout tip">
<strong>Recommended habit</strong>
Start every shift by reviewing <em>Conflicts</em> then <em>Not Yet Quoted</em>, in that order. Conflicts can hold urgent orders already in motion that need rescuing; Not Yet Quoted is potential revenue waiting on a reply.
</div>

---

## Order lifecycle {#lifecycle}

An order goes through four phases visible to the administrator. The system moves the order between states automatically when the driver or customer takes an action; the administrator steps in at the decision points.

<div class="lifecycle">
  <div class="step"><span class="num">1</span><strong>Quote</strong><span>customer creates — admin quotes</span></div>
  <div class="step"><span class="num">2</span><strong>Approve</strong><span>customer accepts quote</span></div>
  <div class="step"><span class="num">3</span><strong>Dispatch</strong><span>assign driver + route</span></div>
  <div class="step"><span class="num">4</span><strong>Execute</strong><span>pickup and delivery</span></div>
  <div class="step"><span class="num">5</span><strong>Reconcile</strong><span>adjust actual amounts</span></div>
  <div class="step"><span class="num">6</span><strong>Close</strong><span>charge and archive</span></div>
</div>

The following sections detail each phase from the administrator's perspective.

---

## 1 · Quoting a new order {#quote}

When a customer creates an order from their app, it lands in the panel in <span class="pill amber">Pending</span> state with no quote. It will appear in the _Not Yet Quoted_ tab of Needs Attention and at the top of the Orders list.

For this guide we follow a real order (`ORD-KA2SEDK3A75X`) created by customer Lorenzo Wynberg with the task "Buy 2 boxes of milk and bread at Auto Mercado" and delivery to Calle 6, Hospital, San José.

<figure>
  <img src="/guide/screenshots/21-orders-list.png" alt="Order list showing a freshly created pending order" />
  <figcaption>The newly created order appears at the top of the Orders list with status <em>Pending · Unpaid</em>.</figcaption>
</figure>

### Step 1.1 — Spot it in Needs Attention {#step-1-1}

When the order arrives, the _Not Yet Quoted_ tab counter goes up. That's the first signal of the day.

<figure>
  <img src="/guide/screenshots/22-needs-attention.png" alt="Needs Attention with badge on Not Yet Quoted" />
  <figcaption>The <em>Not Yet Quoted</em> tab shows <strong>1</strong> — one order awaiting a quote. (Same capture as above, so it predates the sixth tab.)</figcaption>
</figure>

### Step 1.2 — Open the order detail {#step-1-2}

Click the order to open its detail. At this point you'll see the stops, the time details, the quote history (empty here), and payments.

<figure>
  <img src="/guide/screenshots/23-order-detail-pending.png" alt="Detail of a pending order with no quote" />
  <figcaption>Order detail in pending state. Notice the yellow warning at the top and that the pickup stop only has a description ("Buy 2 boxes of milk and bread at Auto Mercado") but no address — the <em>+ Add Address</em> button lets you assign one.</figcaption>
</figure>

<div class="callout warn">
<strong>Every stop must have an address before quoting</strong>
When the customer only describes the task without pinning a location, the administrator has to add the address of the store where the purchase will happen. Without complete addresses, the <em>Create Quote</em> button is disabled.
</div>

### Step 1.3 — Add the pickup address {#step-1-3}

1. On the _Stops_ card, click `+ Add Address` inside the pickup stop.
2. Search for the store in the [Addresses](#addresses) directory or enter a new one.
3. Confirm. The stop completes, the yellow warning disappears, and the `Create Quote` and `Calculate Distance` buttons appear.

<figure>
  <img src="/guide/screenshots/30-order-ready-to-quote.png" alt="Order with all addresses filled, ready to quote" />
  <figcaption>The order now has Auto Mercado Sabana Sur as the pickup address. The <em>Create Quote</em> button is active in the top right.</figcaption>
</figure>

### Step 1.4 — Create the quote (Draft) {#step-1-4}

1. Click `Create Quote`.
2. A dialog opens where you can:
   - Add product lines per stop (description, quantity, estimated unit price) — from a catalog or entered manually.
   - Apply a service tier: <span class="pill gray">Regular</span>, <span class="pill amber">Express</span>, <span class="pill red">Urgent</span>.
   - Add special surcharges or discounts.
3. The system automatically calculates the delivery fee from distance, tier, and the service window per the [Pricing Rules](#pricing).
4. On save, the quote lands in <span class="pill gray">Draft</span> state — saved but not yet visible to the customer.

<figure>
  <img src="/guide/screenshots/31-order-quote-draft.png" alt="Order with a draft quote" />
  <figcaption>The quote appears in <em>Quote History</em> tagged <em>Draft</em>. Estimated total: ₡7,684.00 (includes base, distance, and estimated products).</figcaption>
</figure>

### Step 1.5 — Send the quote to the customer {#step-1-5}

When the quote is reviewed, click `Send to Customer`. The quote status moves to <span class="pill blue">Sent</span> and the order to <span class="pill blue">Quoted</span>. The customer gets a notification in their app and can accept or reject.

<figure>
  <img src="/guide/screenshots/32-order-quote-sent.png" alt="Quote sent to the customer" />
  <figcaption>Updated state: order <em>Quoted</em> — waiting on the customer's reply. The <em>Outsource</em> button also appears for scenarios where operations need to sub-contract.</figcaption>
</figure>

### Step 1.6 — Customer accepts → order Approved {#step-1-6}

When the customer accepts from their app, the order automatically moves to <span class="pill green">Approved</span>. The quote shows the estimated purchase line items and the order is ready to dispatch.

<figure>
  <img src="/guide/screenshots/33-order-approved.png" alt="Approved order with accepted quote" />
  <figcaption>State <em>Approved</em>. Quote <em>QUO-K9N5EXSZ6NFY</em> is <em>Accepted</em>. Product lines are visible under each stop.</figcaption>
</figure>

### Quote states {#quote-states}

| State                                     | Meaning                                                                         |
| ----------------------------------------- | ------------------------------------------------------------------------------- |
| <span class="pill gray">Draft</span>      | Saved but not sent — only the admin sees it.                                    |
| <span class="pill blue">Sent</span>       | Visible to the customer; waiting for approval.                                  |
| <span class="pill green">Accepted</span>  | Customer accepted. The order moves to <span class="pill green">Approved</span>. |
| <span class="pill red">Rejected</span>    | Customer rejected. You can generate another quote if needed.                    |
| <span class="pill gray">Expired</span>    | The validity date passed without acceptance.                                    |
| <span class="pill green">Finalized</span> | Generated at closeout after reconciliation.                                     |

<figure>
  <img src="/guide/screenshots/20-quotes-list.png" alt="Quote list" />
  <figcaption><em>Quotes</em> section — complete history of every quote in the system with filters by state, date, and amount.</figcaption>
</figure>

---

## 2 · Dispatching the order {#dispatch}

An <span class="pill green">Approved</span> order is ready to be assigned a driver and given a route. The system tries to do this automatically via `AutoDispatchService`, which evaluates:

- Schedule feasibility against the customer's window.
- Distance from the driver's current position / next destination.
- Remaining vehicle capacity.
- Route density — the algorithm prefers to add stops to a driver already active in the area rather than tasking an idle one (the _bin-packing_ strategy).

<div class="callout info">
<strong>Auto-dispatch vs manual</strong>
The vast majority of orders dispatch themselves. The administrator steps in when a conflict appears: the order lands on the <em>Conflicts</em> tab of Needs Attention with the reason described.
</div>

### Dispatch result {#dispatch-result}

Once assigned, the state moves to <span class="pill blue">Driver Assigned</span>, the pickup stop is re-typed to _Purchase_ (because it has items to buy), and an entry shows up in the Routes section.

<figure>
  <img src="/guide/screenshots/35-order-assigned.png" alt="Order with driver assigned" />
  <figcaption>Order with <em>Driver Assigned</em>. The stop is renamed <em>Purchase</em> to reflect that the driver must buy the products before delivering them.</figcaption>
</figure>

<figure>
  <img src="/guide/screenshots/36-routes-active.png" alt="Routes section with the newly assigned route" />
  <figcaption><em>Routes</em> section. The new route <em>RTE-FBU8B79YW4JT</em> has two stops (Purchase → Delivery), a live map, and the <em>Outsource Driver</em> and <em>Optimize Route</em> buttons.</figcaption>
</figure>

### When there's a conflict {#dispatch-conflict}

If the system can't find a feasible dispatch, the order stays in _Conflicts_. The typical actions are:

1. **Assign manually** — open the order, click `Assign Driver`, pick from the list.
2. **Adjust the window** — extend the time range if availability is the only blocker.
3. **Sub-contract (outsourcing)** — pay an external provider. Only when there's no other option, since it cuts into margin.
4. **Cancel** — return to the customer with an explanation.

<div class="callout warn">
<strong>One delivery per order</strong>
Each order has exactly one final delivery point. If a customer needs deliveries to multiple destinations, they must create separate orders. The system rejects a second "delivery" stop on the same order.
</div>

---

## 3 · Monitoring execution {#monitor}

Once assigned, the order moves through states as the driver progresses:

| State                                                                                                                        | Meaning                                                |
| ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| <span class="pill blue">Driver Assigned</span>                                                                               | Driver received the assignment but hasn't started yet. |
| <span class="pill blue">Picking Up</span> · <span class="pill blue">Arriving</span> · <span class="pill blue">On Site</span> | Sub-states during the pickup/purchase phase.           |
| <span class="pill blue">Picked Up</span>                                                                                     | Purchases made, ready to deliver.                      |
| <span class="pill blue">In Transit</span>                                                                                    | On the way to the final destination.                   |
| <span class="pill blue">Arriving</span> · <span class="pill blue">On Site</span> (delivery)                                  | Sub-states for the delivery phase.                     |
| <span class="pill amber">Waiting Confirmation</span>                                                                         | Awaiting customer PIN or proof photo.                  |
| <span class="pill green">Completed</span>                                                                                    | Delivered with proof recorded.                         |

### Pickup — the driver buys {#monitor-pickup}

<figure>
  <img src="/guide/screenshots/37-order-picking-up.png" alt="Order in Picking Up state" />
  <figcaption>State <em>Picking Up</em> — the driver is at or on the way to the store to make the purchase.</figcaption>
</figure>

### In transit — heading to the destination {#monitor-transit}

<figure>
  <img src="/guide/screenshots/39-order-in-transit-active.png" alt="Order in transit" />
  <figcaption>State <em>In Transit</em> — the purchase is done and the driver is heading to the customer.</figcaption>
</figure>

### Delivery completed {#monitor-delivered}

When the delivery is confirmed with PIN and photo, the order moves to <span class="pill green">Completed</span>. The stops are marked _Completed_.

<figure>
  <img src="/guide/screenshots/40-order-completed-needs-reconciliation.png" alt="Completed order awaiting reconciliation" />
  <figcaption>Order <em>Completed</em> with finished stops. The original quote stays as reference and the payment shows in <em>Authorized</em> state (pre-authorized, ready to capture the final amount after reconciliation).</figcaption>
</figure>

### PIN and proof of delivery {#pin-and-pod}

Every order has a **6-digit PIN** generated at creation. The customer receives it in their app; the driver must ask for it on delivery to confirm identity. Depending on configuration, the system may also require:

- **Photo proof** — the driver photographs the delivered package.
- **Signature** — the recipient signs on screen.

Without the required proof, the order stays in <span class="pill amber">Waiting Confirmation</span> until resolved.

---

## 4 · Reconciling final amounts {#reconcile}

Reconciliation is the post-delivery adjustment: the initial quote is an _estimate_ of how much the products will cost. The real price is only known once the driver actually buys. Reconciliation squares both amounts and generates a charge or credit if there's a difference.

<div class="callout info">
<strong>When it shows up</strong>
<span class="pill green">Completed</span> orders with an <em>Authorized</em> payment and no reconciliation appear in the <em>Reconciliation</em> tab of Needs Attention.
</div>

<figure>
  <img src="/guide/screenshots/41-needs-attention-conciliacion.png" alt="Reconciliation tab with a pending order" />
  <figcaption>The <em>Reconciliation</em> tab shows <strong>1</strong> — the just-completed order awaits adjustment.</figcaption>
</figure>

### Step 4.1 — Open the reconciliation dialog {#step-4-1}

From the detail of a completed order with an authorized payment, a `Reconcile` button appears in the header (also directly accessible from the _Reconciliation_ tab of Needs Attention). Clicking it opens the full form.

<figure>
  <img src="/guide/screenshots/42-reconciliation-dialog.png" alt="Reconciliation dialog opened over the completed order" />
  <figcaption>The <em>Reconcile Order</em> dialog. Header shows <em>Original Quote Total</em> (₡7,684.00) and <em>Customer Paid</em>. Under <em>Items</em> each purchase stop is listed with its lines (editable quantity + unit price and a per-line total). The footer calculates <em>Service Fees</em>, <em>Items Total</em>, <em>Tax</em>, <em>New Estimated Total</em>, and the <strong>Difference</strong> (delta) in red or green depending on the sign.</figcaption>
</figure>

### Step 4.2 — Adjust lines with real prices {#step-4-2}

1. For each line, edit the _Quantity_ and _Unit Price_ using what was actually paid (based on the purchase receipt). For example, if the _1L milk box (×2)_ quoted at ₡1,500 came out to ₡1,700, enter ₡1,700.
2. If the driver bought extras that weren't on the quote, click `+ Add Item` and record the new line.
3. If some item wasn't found, click the _×_ at the end of the line to remove it — it drops out of the total.
4. Use the _Notes_ field to leave the customer context about the adjustment (optional but recommended when there's a surcharge).
5. Check the _Difference_ row: positive = surcharge (customer owes the difference), negative = credit (we charge less than authorized), zero = no adjustment.

### Step 4.3 — Generate the reconciliation {#step-4-3}

When you confirm the dialog, the system:

- Creates a new quote in <span class="pill green">Finalized</span> state (version 2).
- Captures from the authorized payment the correct final amount. If real < authorized, only the real amount is captured. If real > authorized, the payment is marked <span class="pill amber">Surcharge Due</span>.
- Stamps the order with `reconciled_at` and removes it from the _Reconciliation_ tab.

<figure>
  <img src="/guide/screenshots/42-order-reconciled.png" alt="Order after reconciliation" />
  <figcaption>Order after reconciling. The new <em>Finalized</em> v2 quote appears with the actual amount (₡10,339.50) next to the originally accepted quote (₡7,684.00). The <em>Authorized</em> payment has been captured at the correct amount.</figcaption>
</figure>

### Possible outcomes {#reconciliation-outcomes}

| Difference       | Result                                                                                     | Payment state                                                |
| ---------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| Real = quoted    | No adjustment — capture the authorized amount.                                             | <span class="pill green">Paid</span>                         |
| Real &lt; quoted | Capture only the real (lower) amount. The customer pays only what was actually bought.     | <span class="pill green">Paid</span>                         |
| Real &gt; quoted | Surcharge — the customer must pay the difference, usually with a second charge or balance. | <span class="pill amber">Surcharge Due</span> until covered. |

<div class="callout tip">
<strong>Payments are "authorized" before delivery</strong>
When the quote is accepted, the payment gateway authorizes a hold for the quoted amount but <em>doesn't charge yet</em>. Reconciliation is what fires the final capture: at exactly the right amount, no more and no less. This avoids refunds and surprise charges. <strong>This is the per-order path</strong>; an account billed by period takes no hold at all — see <a href="#period-bills">Billing on account</a>.
</div>

---

## Billing on account {#period-bills}

Most customers pay per order: the quote is authorized when they accept it and captured at [reconciliation](#reconcile). **An account can instead be billed by period** — it orders all week or all month, nothing is charged per delivery, and one bill covering every order in the period closes at the end of it.

Two things follow, and both change what you see on screen:

- An order billed this way is stamped <span class="pill blue">On Account</span> rather than <span class="pill amber">Unpaid</span>. It is **not** an unpaid order: somebody is paying for it, on a bill that hasn't closed yet.
- Nobody is asked to collect at the door, so the driver's collect step is suppressed. That's deliberate, not a missing prompt.

<div class="callout info">
<strong>Nothing is charged automatically</strong>
The bill closes and sends itself — that is the only automatic part. The <em>money</em> is always an act a person performs: the customer pays it from their app, or an administrator records a payment that arrived some other way. <strong>No saved card is ever charged in the background.</strong> A card saved to check out a delivery is not permission to settle an account balance, so a bill that goes unpaid is followed up by a person, like any other invoice.
</div>

### The life of a bill {#bill-states}

| Internal code           | Label                                                 | Meaning                                                                                                                                                                                                  |
| ----------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`                  | <span class="pill gray">Open</span>                   | The period is still running. Orders join the bill as they're approved and the total moves. **Nothing is owed yet** — an open bill has no due date.                                                       |
| `issued`                | <span class="pill blue">Issued</span>                 | The period closed. The total is frozen, any account credit has been applied, a due date is stamped and the customer has been notified.                                                                   |
| `awaiting_verification` | <span class="pill amber">Awaiting Verification</span> | The customer says they sent a transfer and attached a comprobante — the proof of payment. **This is not paid.** The due date hasn't moved and the clock is still running.                                |
| `paid`                  | <span class="pill green">Paid</span>                  | Settled. Every order on the bill flips to <span class="pill green">Paid</span> in the same movement, stamped with how the bill was settled — a bill settles all at once or not at all, never half of it. |

The close runs on the period's clock at **03:00**, with no operator in the loop. That's what makes silence meaningful: nobody has to remember to close a period, so a bill that didn't close is a fault worth reporting. The due date is **7 days** after the close, and a reminder goes to the customer at 08:00 as it approaches.

### The Period bills tab {#bills-tab}

The last tab of [Needs Attention](#needs-attention) is the billing queue. **One row per bill, showing only the most urgent thing wrong with it** — a bill routinely matches more than one of the rows below, and the queue picks the loudest rather than listing it twice.

| Badge                   | Urgency                                | What happened                                                                                                                                                                   | What you do                                                                                                                  |
| ----------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Charge unresolved**   | <span class="pill red">Critical</span> | The customer pressed Pay and the gateway never said what happened. **Their money may already be gone while the bill still reads unpaid**, and nothing resolves this on its own. | Look for a charge against this bill in the gateway before anything else. Don't ask the customer to pay again until you know. |
| **Overdue**             | <span class="pill amber">High</span>   | Past the due date and still owing. **The account is blocked from ordering.**                                                                                                    | Follow the money up. Verifying a declaration or recording a payment settles the bill and unblocks the account.               |
| **Payment to verify**   | <span class="pill blue">Medium</span>  | The customer declared a transfer and attached a comprobante.                                                                                                                    | Find it in the bank, then approve or reject — see below.                                                                     |
| **Unpaid, not yet due** | <span class="pill gray">Low</span>     | Closed a couple of days ago, unpaid, and not due yet.                                                                                                                           | Call them. **This is the valuable one** — nothing is wrong yet, and it's the state that prevents the other two.              |

Rows are ordered most urgent first, then by oldest due date. The urgency counters above the list are the triage signal a flat list can't give you: they say how much of the queue is a customer's money possibly already gone versus a bill that's merely quiet.

<div class="callout warn">
<strong>Reading the queue is staff; acting on a bill is admin</strong>
Any staff operator can open this tab and read a bill. <em>Verify</em>, <em>Approve</em>, <em>Reject</em> and <em>Record payment</em> are restricted to administrators — recording that money arrived on an account, and adjudicating a customer's claim that it did, are accounting acts rather than operational ones. If you can see a bill but not the buttons, that's the reason.
</div>

### Verifying a declared payment {#verify-declaration}

A declaration is a **claim, not a payment**: the customer says they sent money and offers a reference and a comprobante. Nothing settles until somebody finds the transfer.

Click `Verify` on the bill's row (or on the bill detail). The dialog gives you everything the search needs:

1. **The method** — SINPE Móvil or Bank transfer. It tells you which rail to look in.
2. **The reference**, with a copy button beside it. Copy it rather than re-typing it: the bank will only find the transfer on a character-for-character match, and re-typing from memory is where a verification goes wrong.
3. **The amount to look for** — period total, credit applied, and net due in colones. If the customer paid in their own currency, the figure in _that_ currency is shown too, and that is the number that will be on the statement.
4. **Where they were told to send it** — the destination the bill recorded, so you look in the right account. It's a snapshot the bill kept rather than a live row, so it stays readable even after that destination has been edited or deactivated.
5. **The comprobante**, behind a button. It is **corroboration, not evidence**: what settles the question is finding the payment in the bank. It loads only when you ask for it, and its absence never blocks you.

Then one of two outcomes:

- **Approve** — the bill becomes <span class="pill green">Paid</span> and every order on it settles with it. A note is optional.
- **Reject** — **a reason is required**, and the button stays disabled until you write one. That reason reaches the customer, and it is the whole point: a claim rejected without one comes straight back as the same file uploaded again.

<div class="callout warn">
<strong>The note field replaces what's already there</strong>
Approving or rejecting overwrites the bill's note. Whatever note it carries is shown above the field but deliberately not pre-filled — read it before you write, and don't re-send someone else's sentence as your own.
</div>

### Recording a payment that arrived out of band {#record-bill-payment}

Use `Record payment` when the money reached you some other way — cash across the counter, a transfer you've already matched in the bank, a card taken over the phone. This is you asserting a fact rather than filing a claim, so it settles the bill immediately, with no verification step behind it.

| Field                   | Notes                                                                                                                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Payment method**      | Card, SINPE Móvil, Bank transfer or Cash.                                                                                                                                                   |
| **Currency**            | Required — the form won't submit without it. It records _which_ of the bill's already-frozen figures was actually paid, not a rate looked up now.                                           |
| **Payment destination** | Offered for SINPE Móvil and Bank transfer only, and filtered to the active destinations of that method. Changing the method clears the choice, because a destination belongs to one method. |
| **Reference**           | Optional, and pre-filled from the bill when it already has one.                                                                                                                             |
| **Proof of payment**    | Optional here. A customer declaring a transfer must attach one; you already received the money, so your record is the fact.                                                                 |
| **Notes**               | Pre-filled from the bill, because submitting writes this field whatever you do — leave it blank and you'd silently erase a note an earlier act recorded, a rejection reason included.       |

<div class="callout info">
<strong>Account credit is not on the method list, on purpose</strong>
Credit only counts as paid once the period's close has actually applied it against the bill, and nothing else applies it. Recording it by hand would mark a bill paid with money nothing was spent from, so the panel doesn't offer it.
</div>

Cash is on the operator's list and absent from the customer's, and the asymmetry is the point: **a customer cannot prove they handed over cash.** The administrator who received it is the only person who can say it happened at all. Card runs the other way round — the customer can pay by card themselves, in the app, and you can also record one you took elsewhere.

### The bill detail screen {#bill-detail}

`View` on any row opens the bill at `/period-bills/<code>`. **There is no bill list in the sidebar** — the _Period bills_ tab is how you reach one, and the back arrow returns you to it. The same `Verify` and `Record payment` buttons sit in the header, and only for a bill that can still take them: a bill already <span class="pill green">Paid</span> offers neither.

Three parts:

- **Period bill** — period total, credit applied, net due, the date it closed, the date it's due, and one row per currency the bill's lines were agreed in.
- **Payment method** — appears only once there's something to show: the method, the copyable reference, the destination snapshot, the comprobante, the note.
- **What this bill covers** — one row per order, with the order code, the currency it was agreed in, the exchange rate frozen on its quote, and the amount in both that currency and colones.

<div class="callout info">
<strong>Amounts are never re-converted</strong>
A line agreed in colones carries one colón figure and needed no rate — which is why the rate column shows a dash on those rows rather than today's rate. A line agreed in another currency carries that amount, the rate frozen on its quote, and the colón amount derived from it at that moment. Nothing is looked up when the money arrives, so a bill can always state what it is owed before anyone pays it.
</div>

---

## Orders {#orders}

<figure>
  <img src="/guide/screenshots/21-orders-list.png" alt="Full order list" />
  <figcaption>Order list with state, date, and route filters.</figcaption>
</figure>

The complete order list — the source of truth for reports and historical searches. Filters available:

- Order state (every lifecycle state).
- Payment state (Paid, Unpaid, Surcharge).
- Scheduled pickup and delivery.
- Search by order code or customer.

### Anatomy of the order detail page {#order-detail}

<figure>
  <img src="/guide/screenshots/16-order-detail.png" alt="Full order detail" />
  <figcaption>Full order detail — info, stops, quotes, payments.</figcaption>
</figure>

The detail page shows:

- **Header** — order code, status, creation date, quick actions (cancel, delete, assign).
- **Stops** — every stop in order, with address, description, and individual status.
- **Order Details** — service tier, window, requirements (PIN, photo, signature), distance, and estimated time.
- **Quote History** — every quote generated (initial + finalized after reconciliation).
- **Payments** — associated payment records.
- **Timeline** — lifecycle events with timestamps.

---

## Quotes {#quotes}

<figure>
  <img src="/guide/screenshots/20-quotes-list.png" alt="Quotes section" />
  <figcaption>Quote list. Every quote is tied to an order.</figcaption>
</figure>

Alternate view centered on quotes — useful for auditing price changes, seeing acceptance rates, or re-sending expired quotes.

---

## Routes {#routes}

<figure>
  <img src="/guide/screenshots/04-routes.png" alt="Routes section" />
  <figcaption>Active routes with drivers in motion.</figcaption>
</figure>

Live operational view. Each route groups several stops assigned to the same driver. Route density is the dispatcher algorithm's objective — it always tries to pack more stops into fewer routes.

---

## Drivers {#drivers}

A critical section of the panel. This is where you manage the messengers executing the deliveries: personal data, license, vehicle, base location and — most importantly — **their schedule availability**, because without a configured schedule the system can't assign orders to a driver.

<figure>
  <img src="/guide/screenshots/50-drivers-list.png" alt="Driver list with two records" />
  <figcaption>Driver list. The <em>+ Create driver</em> button is in the top-right corner. Each row shows <em>Active / Inactive</em> status, license number and expiry, vehicle plate, and creation date.</figcaption>
</figure>

### Internal vs Outsourced {#internal-vs-outsourced}

The system distinguishes two driver types:

| Type                      | When to use                                                                        | Characteristics                                                                                                                            |
| ------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Internal** (on payroll) | Regular day-to-day operation.                                                      | Fixed salary. Has a **configurable schedule** and a **base location**. The system considers them for auto-dispatch based on feasibility.   |
| **Outsourced**            | When no internal driver is feasible for an order and the window can't be adjusted. | External provider paid per trip. **No** schedule or base location — their availability is assumed on demand. Cuts margin; use judiciously. |

<div class="callout info">
<strong>Internal drivers are on payroll, not per-trip</strong>
Internal drivers earn a fixed salary. That changes how you think about assignment: there's no incentive to "spread" trips — we optimize for operational efficiency (dense routes, minimum active drivers).
</div>

### Driver detail — Details tab {#driver-details}

<figure>
  <img src="/guide/screenshots/51-driver-detail.png" alt="Internal driver detail" />
  <figcaption><em>Details</em> tab. Header with name, public ID, <em>Active</em> toggle, and <em>Delete</em> button. Four cards with the essential info.</figcaption>
</figure>

The _Details_ tab has five cards:

| Card                                                            | Content                                                           | Actions                                                                                               |
| --------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **User Account**                                                | Name, email, phone.                                               | <em>View User Profile</em> button opens the driver's account in the Users section.                    |
| **License Info**                                                | License number and expiry date.                                   | If the license is expired, the <span class="pill red">Expired</span> tag appears automatically.       |
| **Vehicle Info**                                                | License plate.                                                    | Editable.                                                                                             |
| **Dates**                                                       | Creation and last-update dates.                                   | Read-only.                                                                                            |
| **Base Location** <span class="pill gray">internals only</span> | Coordinates and address where the driver starts/ends their shift. | <em>Edit/Set</em> button opens a map to pin the position. Used for dispatch feasibility calculations. |

#### Active toggle

The _Active_ toggle in the top-right controls whether the driver is globally available for assignments. Useful for vacations, suspensions, or long leaves — flip it instead of deleting the record.

### Configuring the driver's schedule — Schedule tab {#driver-schedule}

**This is the critical configuration so the driver can receive orders.** Without availability blocks, the auto-dispatch algorithm will never consider them — they'll never get stops.

<figure>
  <img src="/guide/screenshots/52-driver-schedule.png" alt="Driver availability calendar" />
  <figcaption><em>Schedule</em> tab — weekly availability calendar. Blue blocks are scheduled future shifts; gray blocks are past days (not editable).</figcaption>
</figure>

#### How the calendar works

- **Default view: Week**, with hours from 4:00 a.m. to 10:00 p.m. The _Month_ button switches to monthly view.
- **Each blue block is an available shift** — during that range the driver can be assigned work.
- **Past days appear gray** and are read-only (no history rewriting).
- **Today is highlighted** in light yellow.

#### Create an availability block

1. Click on the desired day and time in the calendar, or drag to select a range.
2. A dialog opens where you can fine-tune the start and end times.
3. Confirm. The block lands on the calendar as a scheduled shift.
4. Repeat to cover the driver's working week.
5. **Important:** click `Save` in the top-right when you're done — changes don't persist until you save.

#### Edit or delete a block

1. Click an existing block.
2. The dialog opens in edit mode — adjust times or click `Delete`.
3. Remember to save changes at the end.

<div class="callout warn">
<strong>The past doesn't change</strong>
Days before today are locked. If you need to correct a historical schedule, route it through the technical team (the change can affect reports and metrics).
</div>

<div class="callout tip">
<strong>Recommended pattern</strong>
Configure next week's schedule every Friday. Use morning (08:00–12:00) and afternoon (13:00–17:00) blocks separated by an hour for lunch, or a single continuous block (08:00–17:00) depending on the contract. Multiple blocks per day respect statutory breaks without the algorithm assigning stops during lunch.
</div>

### Create a new driver {#driver-create}

<figure>
  <img src="/guide/screenshots/53-driver-create.png" alt="Driver create form" />
  <figcaption><em>Create Driver</em> form. The <em>Personal Information</em> section is on top (name, email, phone, password, date of birth, sex, language, avatar) with <em>License Information</em> below (license number, vehicle plate).</figcaption>
</figure>

Adding a new driver requires:

| Field                          | Required | Notes                                                                           |
| ------------------------------ | -------- | ------------------------------------------------------------------------------- |
| Full name                      | Yes      | Shown in customer notifications and the list.                                   |
| Email                          | Yes      | The login for the driver's mobile app.                                          |
| Phone                          | Yes      | Costa Rica format: `+506 XXXX-XXXX`.                                            |
| Password                       | Yes      | Generate a temporary one — the driver can change it on first sign-in.           |
| Date of birth                  | Yes      | For age verification and payroll data.                                          |
| Sex                            | Yes      | Predefined list.                                                                |
| Language code                  | Yes      | The language they'll receive notifications in (es / en / fr).                   |
| Avatar                         | No       | Photo that customers and the admin dashboard will see.                          |
| License number                 | Yes      | Format validated.                                                               |
| Vehicle plate                  | Yes      | CR format: `ABC-123`.                                                           |
| License expiry date            | Yes      | The system marks it <span class="pill red">Expired</span> once the date passes. |
| License photo (front and back) | Yes      | Attach PDF or image for audit.                                                  |

#### After creating the driver

1. Open the freshly created driver's detail.
2. On the _Details_ tab, configure the **Base Location** (where they start their workday).
3. Switch to the _Schedule_ tab and configure their availability for the current week.
4. Flip the _Active_ toggle on if it isn't.

Only after these three steps is the driver ready to receive auto-assigned work.

---

## Users {#users}

<figure>
  <img src="/guide/screenshots/07-users.png" alt="User list" />
  <figcaption>Individual customers registered on the platform.</figcaption>
</figure>

Individual customers. Here you can view per-customer order history, registered payment methods, and account state.

---

## Businesses {#businesses}

<figure>
  <img src="/guide/screenshots/09-businesses.png" alt="Business list" />
  <figcaption>Corporate customers.</figcaption>
</figure>

Business accounts. Businesses can have:

- Multiple authorized users who can create orders.
- Negotiated tariffs different from the public rate.
- Consolidated billing by period instead of per order — see [Billing on account](#period-bills).
- Their own directory of frequent addresses.

---

## Addresses {#addresses}

<figure>
  <img src="/guide/screenshots/10-addresses.png" alt="Address directory" />
  <figcaption>Reusable directory of frequent store and customer addresses.</figcaption>
</figure>

Shared directory. Keeping this directory up to date speeds up quoting: instead of geocoding "Auto Mercado, Sabana Sur" by hand every time, you pick it from the directory.

---

## Catalogs {#catalogs}

<figure>
  <img src="/guide/screenshots/11-catalogs.png" alt="Product catalogs" />
  <figcaption>Product catalogs for fast quoting.</figcaption>
</figure>

Preloaded product lists with suggested prices. When quoting, the administrator can pick catalog lines instead of typing them. Useful for repeat customers or standard baskets.

---

## Pricing Rules {#pricing}

<figure>
  <img src="/guide/screenshots/12-pricing.png" alt="Pricing rules" />
  <figcaption>Tariff configuration by distance, tier, and service window.</figcaption>
</figure>

Defines how the system calculates delivery cost. Main variables:

- **Distance** — base fee + cost per kilometer.
- **Tier** — Regular, Express, Urgent — multiply the base fee.
- **Service window** — business hours vs night or holidays.
- **Special surcharges** — added weight, fragile handling, etc.

<div class="callout warn">
<strong>Changes affect future quotes</strong>
Already-issued quotes keep their price. Only new quotes recalculate with the updated rules.
</div>

---

## Notifications {#notifications}

<figure>
  <img src="/guide/screenshots/13-notifications.png" alt="Notification center" />
  <figcaption>Notification center — operationally relevant events.</figcaption>
</figure>

Feed of system events for the admin team: new orders, accepted quotes, dispatch conflicts, drivers reporting problems, failed payments, refund requests. Every field is `camelCase` and follows the types defined in `Api.Broadcast.*`.

---

## Audit Logs {#audit-logs}

<figure>
  <img src="/guide/screenshots/14-audit-logs.png" alt="Audit logs" />
  <figcaption>Log of who did what.</figcaption>
</figure>

Immutable record of every administrative action. Useful for:

- Investigating discrepancies on orders (who cancelled? who changed the tariff?).
- Regulatory compliance.
- Training — review actions taken by new staff.

---

## Settings {#settings}

<figure>
  <img src="/guide/screenshots/15-settings.png" alt="General settings" />
  <figcaption><em>Settings</em> screen. The screenshot predates three of the cards now on it — the current list is below.</figcaption>
</figure>

This is where global operational parameters live. The list is intentionally short — only what an administrator needs to change by hand. The rest of the behavior (rates, per-order windows, dispatch feasibility) is modeled in its own sections.

The cards, top to bottom. The first three are edited in place; the last three carry a right-arrow and open a sub-page.

| Card                        | What it sets                                                                                                                                                                                                                              |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Language**                | The interface language for the administrator using it — see below.                                                                                                                                                                        |
| **Supported Vehicle Types** | Which vehicle types a driver in this fleet may be assigned. Tick the ones you operate and save.                                                                                                                                           |
| **Waiting time**            | Rate per minute and tolerance beyond the estimate, for time a driver spends waiting at a stop past what it was quoted for. Set the rate to zero and waiting isn't charged at all. A price-list decision, made once — not a per-order one. |
| **Currency Settings** →     | Which currencies the platform accepts, how rates are obtained, and how each rounds.                                                                                                                                                       |
| **Payment destinations** →  | Where customers are told to send money for a period bill.                                                                                                                                                                                 |
| **Service Window** →        | When the platform accepts new orders, and what happens to orders left without a driver.                                                                                                                                                   |

### Language

Switches the interface language for the current administrator between **English**, **Spanish**, and **French**. The choice persists per user and rewrites the URL prefix (`/en/...`, `/es/...`, `/fr/...`).

### Currency Settings {#settings-currencies}

<figure>
  <img src="/guide/screenshots/15b-currencies.png" alt="Currency Settings screen in automatic mode" />
  <figcaption><em>Currency Settings</em> screen in <em>Automatic</em> mode. Top to bottom: <em>Sync Rates</em> button, <em>Exchange Rate Mode</em> card, <em>Base Currency</em> card (CRC with 2-decimal precision), and the enabled-currencies table.</figcaption>
</figure>

This section controls which currencies the platform accepts, how exchange rates are obtained, and how each one is rounded when displaying prices. Every pricing rule and quote is stored internally in the **base currency**; other currencies are converted from that base when shown to the user.

#### Exchange rate mode: Automatic vs Manual

The first switch decides how rates are obtained:

- **Automatic** <span class="pill green">default</span> — the system pulls rates from external providers (e.g. _gometa_) and refreshes them on schedule. The `Sync Rates` button appears in the top-right to force an immediate update.
- **Manual** — the administrator sets the exchange rate manually per currency. Useful when you want to use a fixed bank-negotiated rate or insulate operations from intraday swings.

<figure>
  <img src="/guide/screenshots/15b3-currency-manual-mode.png" alt="Currency Settings in Manual mode" />
  <figcaption>Same panel after flipping the switch to <em>Manual</em>. The <em>Sync Rates</em> button disappears, the <em>Rate Date</em> column for each non-base currency shows the <span class="pill gray">Manual</span> tag, and <em>Exchange Rate</em> stays at <em>–</em> until entered by hand.</figcaption>
</figure>

#### Base currency

The _Base Currency_ card shows which currency holds all internal amounts (in the example, CRC with 2-decimal precision). It can't be disabled and its exchange rate is always `1.000000`. Changing the base currency is a migration operation — not done from this panel.

#### Currencies table

The table lists every configured currency. Columns:

| Column                   | What it shows                                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **Code / Name / Symbol** | ISO 4217 identifiers and the displayed currency (e.g. `USD · US Dollar · $`).                                            |
| **Exchange Rate**        | Current rate relative to the base currency. In manual mode shows the admin-set rate.                                     |
| **Rate Date**            | When it was last updated, tagged with the source (e.g. _gometa_) or <span class="pill gray">Manual</span>.               |
| **Rounding**             | Summary of mode + increment (e.g. `nearest @ 0.01`).                                                                     |
| **State**                | <span class="pill blue">Base</span>, <span class="pill green">Active</span>, or <span class="pill gray">Disabled</span>. |
| **Enabled**              | Switch to enable/disable. The base currency can't be disabled.                                                           |
| **Actions**              | _Edit_ button — opens the currency configuration dialog.                                                                 |

#### Edit dialog — rounding

<figure>
  <img src="/guide/screenshots/15b2-currency-rounding-edit.png" alt="Rounding edit dialog" />
  <figcaption><em>Edit Rounding Settings</em> dialog. Two fields: <em>Rounding Mode</em> (Nearest, Round Up, Round Down) and <em>Rounding Increment</em> (0.01 = cents, 0.10 = dimes, 0.50, 1.00…).</figcaption>
</figure>

Rounding affects how amounts are presented to the customer, not how they're stored internally. For example, a quote calculated at ₡7,683.50 with increment `1` and _Nearest_ mode displays as ₡7,684.

#### Edit dialog — manual rate (Manual mode only)

<figure>
  <img src="/guide/screenshots/15b4-currency-manual-rate-edit.png" alt="Edit dialog with manual rate for USD" />
  <figcaption>In <em>Manual</em> mode, editing a non-base currency reveals the <em>Manual Exchange Rate</em> field. The conversion preview shows both directions (1 USD = 490 CRC and 1 CRC = 0.002041 USD) and warns if the value looks inverted.</figcaption>
</figure>

<div class="callout warn">
<strong>Direction of the rate</strong>
The rate is entered as <em>how many units of the base currency equal 1 unit of this currency</em>. If you accidentally enter it inverted (e.g. <code>0.002</code> instead of <code>490</code>), the preview paints an amber warning suggesting the inverse value.
</div>

### Payment destinations {#settings-payment-destinations}

Declaring a transfer without a destination asks somebody to pay and doesn't say where, so this list is what makes SINPE Móvil and bank transfer usable at all. These are the company's own accounts, not anything the customer registers.

The table lists every destination with its method, holder, account number (or phone number, for SINPE Móvil), currency and active state. `+ Create` opens the form; the pencil edits a row and the bin deletes one.

The form's fields depend on the method:

| Method            | Fields it takes                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| **SINPE Móvil**   | Phone number. No currency — SINPE Móvil receives colones and nothing else.                         |
| **Bank transfer** | Currency, bank name, account number, and IBAN if there is one.                                     |
| **Both**          | Holder name and legal id (both required), a maximum amount, a sort order, and the _active_ switch. |

The **maximum amount** is the per-transfer cap — SINPE Móvil has a real one, and a destination over it simply isn't offered for a bill that large. It's a filter on amount, not on which bills may use the method: a bill stated in dollars paid by SINPE Móvil is just being paid in colones.

<div class="callout warn">
<strong>Deactivate rather than delete, and create rather than re-point</strong>
A bill records the destination it showed the customer as a <em>snapshot</em>, so deleting a row never rewrites an old bill — but a deactivated row stays legible to whoever is reading one. And the <em>method</em> can't be changed after creation: it decides which of the other fields the row may carry, so switching it in place would leave a destination holding the wrong method's details. To move a destination to another method, deactivate it and create a new one.
</div>

### Service Window {#settings-service-window}

<figure>
  <img src="/guide/screenshots/15c-service-window.png" alt="Service Window screen" />
  <figcaption><em>Service Window</em> screen. Three cards: enable/disable, <em>Operating Hours</em> (with the green/red visual bar when active), and <em>Unassigned Order Escalation</em>.</figcaption>
</figure>

This is where you define when the platform accepts new orders and what to do with orders left without a driver too long. The configuration is global — it affects customers, drivers, and the dispatcher equally.

#### Enable / disable the window

The first switch turns the service window on or off. **When disabled**, customers can create orders 24/7 and the algorithm rejects nothing on schedule grounds. **When enabled**, orders outside operating hours are blocked or queued for the next interval.

#### Operating hours

Two time fields control the daily window:

- _Service closes at_ — the hour work stops being accepted (start of the closed block).
- _Service opens at_ — the hour operations resume (end of the closed block).

If the window crosses midnight, the timeline bar draws it correctly: two green segments at the day's ends and a red segment in the middle (closed). In the normal case (open in the morning, close in the evening), you see a green center segment surrounded by two red ones.

#### Unassigned order escalation

Paid orders that don't get a driver auto-escalate to avoid being forgotten:

- **Auto-cancel enabled** — if on, orders that hit the threshold are cancelled with a full refund. If off, the admin is just notified and the order stays open until manual intervention.
- **Escalation threshold (working hours)** — number of hours _inside the service window_ before escalation fires. Accepts 1–24.

<div class="callout info">
<strong>"Working hours", not wall-clock</strong>
The threshold only counts hours inside the service window. An order arriving at 11 p.m. with an 8 a.m.–10 p.m. window and a 4-hour threshold doesn't escalate at 3 a.m. — it escalates at noon the next day, after 4 real hours of open operations.
</div>

---

## State glossary {#state-glossary}

A bill's own states are not here — they live with the workflow that uses them, in [The life of a bill](#bill-states).

### Order states {#order-states}

| Internal code                                             | Label                                                | Meaning                                                  |
| --------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------- |
| `pending`                                                 | <span class="pill amber">Pending</span>              | Customer created the order — awaiting a quote.           |
| `estimated`                                               | <span class="pill blue">Quoted</span>                | Quote sent — awaiting customer reply.                    |
| `approved`                                                | <span class="pill green">Approved</span>             | Customer accepted — ready to dispatch.                   |
| `assigned`                                                | <span class="pill blue">Assigned</span>              | Driver assigned — pickup pending.                        |
| `picking_up` · `arriving_at_pickup` · `arrived_at_pickup` | <span class="pill blue">Pickup</span>                | Sub-states during the pickup phase.                      |
| `picked_up`                                               | <span class="pill blue">Picked Up</span>             | Products in the driver's hands.                          |
| `in_transit`                                              | <span class="pill blue">In Transit</span>            | Heading to the final destination.                        |
| `arriving_at_drop_off` · `arrived_at_drop_off`            | <span class="pill blue">Delivery</span>              | Sub-states on arrival at the destination.                |
| `waiting_confirmation`                                    | <span class="pill amber">Waiting Confirmation</span> | Missing PIN or photo proof.                              |
| `completed`                                               | <span class="pill green">Completed</span>            | Delivered — pending reconciliation.                      |
| `canceled`                                                | <span class="pill gray">Cancelled</span>             | Customer or admin cancelled before dispatch.             |
| `denied`                                                  | <span class="pill red">Denied</span>                 | Admin rejected the quote.                                |
| `delivery_failed`                                         | <span class="pill red">Delivery failed</span>        | Couldn't deliver (customer absent, wrong address, etc.). |
| `returned_to_sender`                                      | <span class="pill gray">Returned</span>              | Products returned to sender.                             |

### Payment states {#payment-states}

All eight, in the order the system declares them.

| Code            | Label                                         | Meaning                                                                                                                                                                                               |
| --------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `unpaid`        | <span class="pill amber">Unpaid</span>        | No payment recorded.                                                                                                                                                                                  |
| `authorized`    | <span class="pill blue">Authorized</span>     | A card hold is placed for the quoted amount. **No money has moved** — a hold expires on its own, and reconciliation is what captures it.                                                              |
| `paid`          | <span class="pill green">Paid</span>          | Full charge received.                                                                                                                                                                                 |
| `on_account`    | <span class="pill blue">On Account</span>     | Billed to the account instead of charged: the order is a line on that period's bill, and becomes <span class="pill green">Paid</span> when the bill settles. See [Billing on account](#period-bills). |
| `surcharge_due` | <span class="pill amber">Surcharge Due</span> | After reconciliation there's a balance to collect.                                                                                                                                                    |
| `refunded`      | <span class="pill gray">Refunded</span>       | Full refund issued.                                                                                                                                                                                   |
| `voided`        | <span class="pill gray">Voided</span>         | The card hold was released without ever being charged — a cancellation before capture.                                                                                                                |
| `chargeback`    | <span class="pill red">Chargeback</span>      | The customer disputed the charge with their bank and the money was pulled back.                                                                                                                       |

---

## Frequently asked questions {#faq}

### The customer wants to change the delivery address after approval — is that allowed? {#faq-edit-address}

Yes, as long as the order is in <span class="pill green">Approved</span> or <span class="pill blue">Assigned</span> state and the driver hasn't started the pickup phase, addresses are editable. Once the order moves to <span class="pill blue">Picked Up</span>, addresses lock. For later changes, the right move is to create a new order.

### What do I do if a driver reports a problem during delivery? {#faq-delivery-problem}

The driver can mark _Delivery Failed_ from their app, which moves the order to <span class="pill red">Delivery failed</span>. That sends it to the _Conflicts_ tab of Needs Attention. Options are: retry delivery (reassign), return to sender, or mark as a loss covered by insurance.

### Auto-dispatch assigned the "wrong" driver — can I reassign? {#faq-reassign-driver}

Yes. From the order detail click `Reassign` — you'll see the list of available drivers sorted by feasibility. Keep in mind that reassigning can worsen overall route density; the algorithm already optimizes for bin-packing.

### When do we sub-contract (outsource)? {#faq-outsource-when}

When no in-house driver is feasible for the order and the customer won't accept extending the window. It's a costly decision — it cuts margin because you pay the external provider. Use judiciously.

### The customer paid but the order ended up in "Surcharge Due" — why? {#faq-surcharge-pending}

Because reconciliation found the real product cost was higher than the initial quote. The customer paid the original quote but there's a delta left. Notify them to collect the difference.

### What's the difference between cancelling and rejecting an order? {#faq-cancel-vs-reject}

**Cancel** is for already-quoted or approved orders that get dropped (customer or admin). **Reject** is exclusive to the quote step — the admin decides not to take the order (insufficient capacity, out of zone, etc.).

### How are delivery PINs generated? {#faq-pin-generation}

Automatically when the order is created — a unique 6-digit code per order. The customer sees it in their app and the driver asks for it on delivery. It's the recipient's identity check.

### A customer says they paid their bill, but it still shows as unpaid — what now? {#faq-declared-not-paid}

Check the bill's state first. <span class="pill amber">Awaiting Verification</span> means their claim arrived and is waiting on **us** — find the transfer in the bank and [approve it](#verify-declaration); the due date is still running until you do, so this is not a wait to leave sitting. If the bill is still <span class="pill blue">Issued</span> with no declaration on it, their payment never reached us as a claim: ask for the reference and the comprobante, or [record it yourself](#record-bill-payment) if you can already see the money.

### Can I settle a bill with the customer's account credit? {#faq-credit-settle}

No, and there's deliberately no option for it. Credit is applied by the period's close, automatically — the bill you're looking at already shows _Credit applied_ and a _Net due_ with the credit taken off. See [Account credit is not on the method list](#record-bill-payment) for why it can't be recorded by hand.

### Why is this account blocked from ordering? {#faq-account-blocked}

One of two reasons, and the account surface tells the customer which: a bill on the account is **past its due date**, or what the account is on the hook for — its unpaid bills plus what this period has run up so far — has reached the limit set for it. The block bites at order creation, so the customer sees it before assembling an order rather than after. Settling the overdue bill clears the first; raising the limit or settling bills clears the second.

### Can I create an order from the panel without the customer initiating one? {#faq-admin-create}

Not directly from the panel. Orders always originate from the customer side (mobile app). The panel manages the lifecycle — quoting, dispatching, reconciling — but doesn't expose a form to create orders by hand. If a customer calls in, the practice is to guide them through creating it from the app or coordinate with the technical team to use the API endpoint directly.
