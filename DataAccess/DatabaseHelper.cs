using System;
using System.IO;
using Microsoft.Data.Sqlite;
using API.Entities;  // 引用实体

namespace MyApp.DataAccess
{
    public static class DatabaseHelper
    {
        // 获取数据库存储路径
        private static string GetDatabasePath()
        {
            string folder = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "MyApp");
            Directory.CreateDirectory(folder);
            return Path.Combine(folder, "store.db");
        }

        // 初始化数据库（创建数据库并设置加密密钥）
        public static void InitializeDatabase()
        {
            string dbPath = GetDatabasePath();
            var connectionString = new SqliteConnectionStringBuilder
            {
                DataSource = dbPath,
                Mode = SqliteOpenMode.ReadWriteCreate,
            }.ToString();

            using (var connection = new SqliteConnection(connectionString))
            {
                connection.Open();

                // 设置密钥（由开发者管理，不暴露给用户）
                using (var cmd = connection.CreateCommand())
                {
                    cmd.CommandText = $"PRAGMA key = 'Your_Secret_Encryption_Key';";
                    cmd.ExecuteNonQuery();
                }

                // 创建 PomodoroSession 表（示例，其他实体也可同理创建对应的表）
                using (var cmd = connection.CreateCommand())
                {
                    cmd.CommandText = @"
                        CREATE TABLE IF NOT EXISTS PomodoroSession (
                            SessionId INTEGER PRIMARY KEY, 
                            StartTime TEXT, 
                            EndTime TEXT, 
                            RewardPoints INTEGER
                        );";
                    cmd.ExecuteNonQuery();
                }
            }
        }

        // 插入一条番茄钟记录
        public static void InsertPomodoroSession(DateTime start, DateTime end, int rewardPoints)
        {
            string dbPath = GetDatabasePath();
            var connectionString = new SqliteConnectionStringBuilder
            {
                DataSource = dbPath,
                Mode = SqliteOpenMode.ReadWrite,
            }.ToString();

            using (var connection = new SqliteConnection(connectionString))
            {
                connection.Open();

                // 每次连接后需要先设置密钥
                using (var cmd = connection.CreateCommand())
                {
                    cmd.CommandText = "PRAGMA key = 'S18254740667j';";
                    cmd.ExecuteNonQuery();
                }

                using (var transaction = connection.BeginTransaction())
                {
                    using (var cmd = connection.CreateCommand())
                    {
                        cmd.CommandText = @"
                            INSERT INTO PomodoroSession(StartTime, EndTime, RewardPoints)
                            VALUES($start, $end, $points);";
                        // 使用 ISO 8601 格式存储时间字符串
                        cmd.Parameters.AddWithValue("$start", start.ToString("o"));
                        cmd.Parameters.AddWithValue("$end", end.ToString("o"));
                        cmd.Parameters.AddWithValue("$points", rewardPoints);
                        cmd.ExecuteNonQuery();
                    }
                    transaction.Commit();
                }
            }
        }
    }
}