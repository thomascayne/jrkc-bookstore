import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { jsonError } from '@/auth/http';
import { hasAnyRole } from '@/auth/authorization';
import { getCurrentUser } from '@/auth/session';
import { getDatabase } from '@/db/client';
import { ROLES } from '@/utils/roles';

const salesRoles = [ROLES.ADMIN, ROLES.STORE_MANAGER, ROLES.SALES_ASSOCIATE] as const;

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !hasAnyRole(user, salesRoles)) {
    return jsonError('Sales access required.', 403);
  }

  const database = getDatabase();
  const summaryResult = await database.execute(sql`
    with totals as (
      select
        coalesce(sum(total_amount), 0)::double precision as total_sales,
        count(*)::integer as total_orders
      from orders
      where status = 'paid'
        and order_date >= date_trunc('day', now())
        and order_date < date_trunc('day', now()) + interval '1 day'
    ), yesterday as (
      select coalesce(sum(total_amount), 0)::double precision as total_sales
      from orders
      where status = 'paid'
        and order_date >= date_trunc('day', now()) - interval '1 day'
        and order_date < date_trunc('day', now())
    )
    select
      totals.total_sales,
      totals.total_orders,
      case when totals.total_orders = 0 then 0
        else totals.total_sales / totals.total_orders end as average_order_value,
      case when yesterday.total_sales = 0 then 0
        else ((totals.total_sales - yesterday.total_sales) / yesterday.total_sales) * 100
      end as comparison_to_yesterday
    from totals cross join yesterday
  `);
  const hourlyResult = await database.execute(sql`
    select
      extract(hour from order_date)::integer as hour,
      coalesce(sum(total_amount), 0)::double precision as sales
    from orders
    where status = 'paid'
      and order_date >= date_trunc('day', now())
      and order_date < date_trunc('day', now()) + interval '1 day'
    group by extract(hour from order_date)
    order by hour
  `);
  const topBooksResult = await database.execute(sql`
    select
      books.id,
      books.title,
      books.authors,
      books.price::double precision as price,
      coalesce(nullif(books.thumbnail_image_link, ''), books.small_thumbnail_image_link) as thumbnail
    from order_items
    inner join orders on orders.id = order_items.order_id
    inner join books on books.id = order_items.book_id
    where orders.status = 'paid'
      and orders.order_date >= date_trunc('day', now())
      and orders.order_date < date_trunc('day', now()) + interval '1 day'
    group by books.id
    order by sum(order_items.quantity) desc
    limit 5
  `);

  const summary = summaryResult.rows[0] ?? {};
  return NextResponse.json({
    averageOrderValue: Number(summary.average_order_value ?? 0),
    comparisonToYesterday: Number(summary.comparison_to_yesterday ?? 0),
    salesByHour: hourlyResult.rows.map((row) => ({
      hour: Number(row.hour),
      sales: Number(row.sales),
    })),
    todayOrders: Number(summary.total_orders ?? 0),
    todaySales: Number(summary.total_sales ?? 0),
    topSellingBooks: topBooksResult.rows,
  });
}
