import { BoxSet } from '../types';

// ========================================
// เซ็ตกล่อง Ayura (Admin กำหนดเอง)
// ========================================
// วิธีใช้: กำหนดรายการวัตถุดิบ (ingredientId) (ingredientId)
//   - ปริมาณจะถูกดึงมาจาก amountInGrams ในไฟล์ ingredients.ts อัตโนมัติ
//
// ระบบจะนำค่า base ไปคูณ multiplier (TDEE ÷ แคลรวม base)
// เพื่อให้สารอาหารและราคาพอดีกับผู้ใช้แต่ละคน
// ========================================

export const boxSets: BoxSet[] = [
    {
        id: 'set-1',
        name: 'เซ็ตลดน้ำหนัก',
        description: 'เซ็ตวัตถุดิบสำหรับคนที่ต้องการลดน้ำหนัก โปรตีนสูง แคลอรี่ต่ำ',
        image: '🥗',
        items: [
            { ingredientId: 'i6', amountInGrams: 200 }, // อกไก่
            { ingredientId: 'i1', amountInGrams: 200 }, // ผักเชียงดา
            { ingredientId: 'i11', amountInGrams: 200 }, // คะน้า
            { ingredientId: 'i9', amountInGrams: 200 }, // ข้าวกล้อง
            { ingredientId: 'i5', amountInGrams: 100 }, // ขิงสด
        ],
    },
    {
        id: 'set-2',
        name: 'เซ็ตเพิ่มภูมิคุ้มกัน',
        description: 'เซ็ตวัตถุดิบสมุนไพรไทยเสริมสร้างภูมิคุ้มกัน',
        image: '🛡️',
        items: [
            { ingredientId: 'i2', amountInGrams: 100 }, // ขมิ้นชัน
            { ingredientId: 'i5', amountInGrams: 100 }, // ขิงสด
            { ingredientId: 'i3', amountInGrams: 100 }, // ตะไคร้
            { ingredientId: 'i10', amountInGrams: 200 }, // มะขามป้อม
            { ingredientId: 'i6', amountInGrams: 200 }, // อกไก่
            { ingredientId: 'i9', amountInGrams: 200 }, // ข้าวกล้อง
        ],
    },
    {
        id: 'set-3',
        name: 'เซ็ตบำรุงผิว',
        description: 'เซ็ตวัตถุดิบบำรุงผิวพรรณ วิตามินซีสูง ต้านอนุมูลอิสระ',
        image: '✨',
        items: [
            { ingredientId: 'i10', amountInGrams: 200 }, // มะขามป้อม
            { ingredientId: 'i12', amountInGrams: 200 }, // ว่านหางจระเข้
            { ingredientId: 'i7', amountInGrams: 105 }, // กระเจี๊ยบแดง
            { ingredientId: 'i4', amountInGrams: 200 }, // ผักหวานป่า
            { ingredientId: 'i6', amountInGrams: 200 }, // อกไก่
            { ingredientId: 'i9', amountInGrams: 200 }, // ข้าวกล้อง
        ],
    },
];
