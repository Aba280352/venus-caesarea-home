<?php
/**
 * Venus thank-you template (replaces woocommerce/checkout/thankyou.php while the new design is on).
 * @var WC_Order|false $order
 */
defined( 'ABSPATH' ) || exit;

$demo = false;
if ( ! $order ) {
	$order = vty_demo_order();
	$demo  = (bool) $order;
}
$shop = wc_get_page_permalink( 'shop' );
?>
<div class="vty-wrap">
<?php if ( $order && $order->has_status( 'failed' ) ) : ?>
	<section class="vty-hero is-failed">
		<h1 class="vct-title">התשלום <b>לא עבר</b></h1>
		<p class="vty-sub">הבנק או חברת האשראי לא אישרו את התשלום, וההזמנה עדיין לא נקלטה. אפשר לנסות שוב או לכתוב לנו.</p>
		<div class="vty-btns">
			<a class="vct-btn vct-btn-green" href="<?php echo esc_url( $order->get_checkout_payment_url() ); ?>">לתשלום חוזר</a>
			<a class="vct-btn vct-btn-line" href="<?php echo esc_url( vct_wa( 'היי ונוס, התשלום על הזמנה ' . $order->get_order_number() . ' לא עבר' ) ); ?>" target="_blank" rel="noopener"><?php echo vct_icon( 'chat-dots' ); ?>וואטסאפ</a>
		</div>
	</section>
<?php elseif ( $order ) :
	$first  = trim( $order->get_billing_first_name() );
	$pickup = $order->has_shipping_method( 'local_pickup' );
	$date   = $order->get_meta( '_vns_delivery_date' );
	$when   = $date ? vck_when_label( $date, $order->get_meta( '_vns_delivery_slot' ) ) : '';
	$greet  = $order->get_meta( '_vns_greeting' );
	$email  = $order->get_billing_email();
	$ship_name = trim( $order->get_shipping_first_name() . ' ' . $order->get_shipping_last_name() );
	$addr   = trim( implode( ', ', array_filter( array( $order->get_shipping_address_1(), $order->get_shipping_address_2(), $order->get_shipping_city() ) ) ) );
	?>
	<ol class="vct-steps vty-steps" aria-label="שלבי ההזמנה"><li class="is-done"><b><?php echo vct_icon( 'check' ); ?></b>עגלה</li><li class="is-done"><b><?php echo vct_icon( 'check' ); ?></b>פרטים ותשלום</li><li class="is-on"><b>3</b>אישור הזמנה</li></ol>
	<section class="vty-hero">
		<span class="vty-check" aria-hidden="true"><?php echo vct_icon( 'check' ); ?></span>
		<h1 class="vct-title">תודה<?php echo $first ? ', ' . esc_html( $first ) : ''; ?>! <b>ההזמנה התקבלה</b></h1>
		<p class="vty-sub">מספר הזמנה <b>#<?php echo esc_html( $order->get_order_number() ); ?></b><?php echo $email ? ' · אישור נשלח אל ' . esc_html( $email ) : ''; ?></p>
	</section>

	<section class="vty-card" aria-label="סיכום ההזמנה">
		<div class="vty-facts">
			<?php if ( $when ) : ?>
				<div class="vty-fact"><?php echo vct_icon( $pickup ? 'store' : 'truck' ); ?><span><small><?php echo $pickup ? 'מועד איסוף' : 'מועד משלוח'; ?></small><b><?php echo esc_html( $when ); ?></b></span></div>
			<?php endif; ?>
			<?php if ( $pickup ) : ?>
				<div class="vty-fact"><?php echo vct_icon( 'location-pin' ); ?><span><small>איסוף מהחנות</small><b>הרקיע 1, מתחם C Center, קיסריה</b></span></div>
			<?php elseif ( $addr ) : ?>
				<div class="vty-fact"><?php echo vct_icon( 'location-pin' ); ?><span><small>נשלח אל</small><b><?php echo esc_html( trim( $ship_name . ( $ship_name ? ' · ' : '' ) . $addr ) ); ?></b></span></div>
			<?php endif; ?>
			<?php if ( $greet ) : ?>
				<div class="vty-fact is-wide"><?php echo vct_icon( 'gift' ); ?><span><small>הברכה בכרטיס</small><b class="vty-greet"><?php echo nl2br( esc_html( $greet ) ); ?></b></span></div>
			<?php endif; ?>
		</div>

		<ul class="vty-items">
			<?php foreach ( $order->get_items() as $item ) :
				$p = $item->get_product(); ?>
				<li>
					<span class="vty-thumb"><?php echo $p ? $p->get_image( 'woocommerce_gallery_thumbnail' ) : ''; ?></span>
					<span class="vty-name"><?php echo esc_html( $item->get_name() ); ?><?php if ( $item->get_quantity() > 1 ) : ?> <i>× <?php echo esc_html( $item->get_quantity() ); ?></i><?php endif; ?></span>
					<span class="vty-price"><?php echo wp_kses_post( $order->get_formatted_line_subtotal( $item ) ); ?></span>
				</li>
			<?php endforeach; ?>
		</ul>

		<table class="vty-totals">
			<?php foreach ( $order->get_order_item_totals() as $key => $total ) :
				if ( 'payment_method' === $key ) { continue; } ?>
				<tr class="<?php echo esc_attr( $key ); ?>"><th><?php echo esc_html( rtrim( wp_strip_all_tags( $total['label'] ), ':' ) ); ?></th><td><?php echo wp_kses_post( $total['value'] ); ?></td></tr>
			<?php endforeach; ?>
		</table>
		<p class="vty-paid"><?php echo vct_icon( 'shield-check' ); ?>שולם ב<?php echo esc_html( $order->get_payment_method_title() ?: 'כרטיס אשראי' ); ?></p>
	</section>

	<div class="vty-btns">
		<a class="vct-btn vct-btn-green" href="<?php echo esc_url( $shop ); ?>">לחזרה לחנות</a>
	</div>
	<?php if ( $demo ) : ?><p class="vty-demo">תצוגה לדוגמה בלבד. זו לא הזמנה אמיתית.</p><?php endif; ?>
	<?php
	if ( ! $demo ) {
		/* gateways / tracking still get their hooks (the default details table is removed in thankyou.php) */
		do_action( 'woocommerce_thankyou_' . $order->get_payment_method(), $order->get_id() );
		do_action( 'woocommerce_thankyou', $order->get_id() );
	}
	?>
<?php else : ?>
	<section class="vty-hero">
		<span class="vty-check" aria-hidden="true"><?php echo vct_icon( 'check' ); ?></span>
		<h1 class="vct-title">תודה! <b>ההזמנה התקבלה</b></h1>
		<p class="vty-sub">אישור נשלח אליך במייל.</p>
	</section>
	<div class="vty-btns"><a class="vct-btn vct-btn-green" href="<?php echo esc_url( $shop ); ?>">לחזרה לחנות</a></div>
<?php endif; ?>
</div>
